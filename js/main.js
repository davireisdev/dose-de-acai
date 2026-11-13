(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  /* ---------- Preço ---------- */
  // "R$ 6" para valor inteiro, "R$ 6,50" com centavos (igual à tabela da loja).
  const fmtInteiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const fmtCentavos = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  // Troca o espaço especial do Intl por um normal: a fonte do título não tem esse caractere.
  const preco = (v) => (Number.isInteger(v) ? fmtInteiro : fmtCentavos).format(v).replace(/[  ]/g, ' ');
  const geladoes = (n) => `${n} ${n === 1 ? 'geladão' : 'geladões'}`;

  // Lista de sabores em uso. Começa com o menu.js (reserva) e pode ser trocada
  // pelo Firebase (js/cardapio-firebase.js) via window.DoseCardapio.set(lista).
  let lista = SABORES.slice();
  const ativos = () => lista.filter((s) => s.ativo !== false);

  const renderPrecoMinimo = () => {
    const disponiveis = ativos();
    if (!disponiveis.length) return;
    const minimo = Math.min(...disponiveis.map((s) => s.preco));
    $$('[data-preco-min]').forEach((n) => { n.textContent = preco(minimo); });
  };

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = (msg, ms = 3600) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), ms);
  };

  /* ---------- WhatsApp ---------- */
  const numero = (SITE.whatsapp || '').replace(/\D/g, '');
  const linkWhats = (texto) => {
    if (numero) return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
    return SITE.whatsappLink || '';
  };

  $$('[data-whatsapp]').forEach((a) => {
    const href = linkWhats(SITE.whatsappMensagem || '');
    if (href) {
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Em breve, nosso WhatsApp por aqui.');
      });
    }
  });

  // Copia o pedido quando o link não aceita mensagem pronta (link da bio, sem número).
  const copiar = (texto) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).then(() => true, () => copiarAntigo(texto));
    }
    return Promise.resolve(copiarAntigo(texto));
  };
  const copiarAntigo = (texto) => {
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.append(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    area.remove();
    return ok;
  };

  const { desenho } = window.DoseDesenho;

  /* ---------- Faixas dos sabores em volta da foto do topo ---------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const CONFEITOS = ['#FFD23F', '#FF5C8A', '#4FC3F7', '#7BD389'];
  const separador = (sabor, k) => {
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    if (sabor.arte === 'confete') {
      const c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', '10'); c.setAttribute('cy', '10'); c.setAttribute('r', '9');
      c.setAttribute('fill', CONFEITOS[k % CONFEITOS.length]);
      svg.append(c);
    } else {
      const estrela = document.createElementNS(SVGNS, 'path');
      estrela.setAttribute('d', 'M10 0Q10 10 20 10Q10 10 10 20Q10 10 0 10Q10 10 10 0Z');
      estrela.setAttribute('fill', 'currentColor');
      svg.append(estrela);
    }
    return svg;
  };

  const faixas = $('#ribbons');
  const renderFaixas = () => {
    if (!faixas) return;
    faixas.replaceChildren();
    const REPETICOES = 6; // por metade; as duas metades são iguais para o laço não pular
    ativos().forEach((sabor) => {
      const faixa = document.createElement('div');
      faixa.className = 'ribbon';
      faixa.dataset.arte = sabor.arte || 'mesclado';
      const trilho = document.createElement('div');
      trilho.className = 'ribbon__track';
      for (let k = 0; k < REPETICOES * 2; k++) {
        const nome = document.createElement('span');
        nome.textContent = sabor.nome;
        trilho.append(nome, separador(sabor, k % REPETICOES));
      }
      faixa.append(trilho);
      faixas.append(faixa);
    });

    // Mesma velocidade em todas as faixas: duração proporcional ao tamanho do texto.
    const ajustarVelocidade = () => {
      $$('.ribbon__track', faixas).forEach((t) => {
        t.style.setProperty('--dur', `${Math.max(12, t.scrollWidth / 2 / 55)}s`);
      });
    };
    ajustarVelocidade();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarVelocidade);
  };

  /* ---------- Cardápio + pedido ---------- */
  const root = $('#menu-root');
  const pedido = new Map(); // id -> quantidade
  const MAX = 99;

  const icone = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;

  const card = (sabor, n) => {
    const li = document.createElement('li');
    const esgotado = sabor.ativo === false;
    li.className = 'flavor' + (esgotado ? ' is-out' : '');
    li.dataset.id = sabor.id;
    li.dataset.arte = (sabor.imagem || sabor.foto) ? 'foto' : (sabor.arte || 'mesclado');
    li.style.setProperty('--n', n);

    const arte = document.createElement('div');
    arte.className = 'flavor__art';
    if (sabor.imagem || sabor.foto) {
      const img = document.createElement('img');
      // foto: imagem enviada pelo painel (data URL); imagem: arquivo em img/
      img.src = sabor.foto || `${SITE.pastaImagens}${sabor.imagem}-720.jpg`;
      img.alt = sabor.alt || sabor.nome;
      img.loading = 'lazy';
      img.decoding = 'async';
      arte.classList.add('flavor__art--photo');
      arte.append(img);
    } else {
      arte.innerHTML = desenho(sabor);
    }

    const corpo = document.createElement('div');
    corpo.className = 'flavor__body';
    const nome = document.createElement('h3');
    nome.className = 'flavor__name';
    nome.textContent = sabor.nome;
    const valor = document.createElement('p');
    valor.className = 'flavor__price';
    valor.textContent = preco(sabor.preco);
    corpo.append(nome, valor);

    const ctrl = document.createElement('div');
    ctrl.className = 'flavor__ctrl';
    if (esgotado) {
      ctrl.innerHTML = '<span class="flavor__out">Esgotado hoje</span>';
      li.append(arte, corpo, ctrl);
      return li;
    }
    ctrl.innerHTML = `
      <button type="button" class="btn btn--accent flavor__add" data-step="1" aria-label="Adicionar ${sabor.nome}">
        ${icone('i-plus')} Adicionar
      </button>
      <div class="stepper" role="group" aria-label="Quantidade de ${sabor.nome}" hidden>
        <button type="button" class="stepper__btn" data-step="-1" aria-label="Tirar um ${sabor.nome}">${icone('i-minus')}</button>
        <span class="stepper__qty">0</span>
        <button type="button" class="stepper__btn" data-step="1" aria-label="Mais um ${sabor.nome}">${icone('i-plus')}</button>
      </div>`;

    li.append(arte, corpo, ctrl);
    return li;
  };

  const orderbar = $('#orderbar');
  const enviar = $('[data-order-send]', orderbar);
  const rotulo = $('[data-order-label]', orderbar);
  const MINIMO = Math.max(1, Number(SITE.pedidoMinimo) || 1);
  const ZONAS = SITE.zonas || [];
  let zona = null; // zona de entrega escolhida

  // Os textos de taxa e de pedido mínimo espalhados pela página saem do config.js.
  const listaPt = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} e ${a[a.length - 1]}` : a[0] || '');
  if (ZONAS.length) {
    const grupos = [];
    ZONAS.forEach((z) => {
      const nome = z.nome.replace(/^zona\s+/i, '').toLowerCase();
      const g = grupos.find((x) => x.taxa === z.taxa);
      if (g) g.nomes.push(nome); else grupos.push({ taxa: z.taxa, nomes: [nome] });
    });
    const texto = grupos.map((g) => `${listaPt(g.nomes)} ${preco(g.taxa)}`).join(' · ');
    $$('[data-taxas]').forEach((n) => { n.textContent = texto; });
  }
  $$('[data-pedido-minimo]').forEach((n) => { n.textContent = MINIMO; });

  // Escolha da zona de entrega (botões de opção montados a partir do config.js)
  const zonasLista = $('[data-zonas]');
  if (zonasLista) {
    ZONAS.forEach((z, i) => {
      const label = document.createElement('label');
      label.className = 'zone';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'zona';
      input.value = String(i);
      const nome = document.createElement('span');
      nome.className = 'zone__name';
      nome.textContent = z.nome;
      const taxa = document.createElement('span');
      taxa.className = 'zone__fee';
      taxa.textContent = preco(z.taxa);
      label.append(input, nome, taxa);
      zonasLista.append(label);
    });
    zonasLista.addEventListener('change', (e) => {
      if (e.target.name !== 'zona') return;
      zona = ZONAS[Number(e.target.value)];
      $$('.zone', zonasLista).forEach((l) => l.classList.toggle('is-on', $('input', l).checked));
      atualizar();
    });
  }

  const resumo = () => {
    let qtd = 0;
    let soma = 0;
    const linhas = [];
    ativos().forEach((s) => {
      const q = pedido.get(s.id) || 0;
      if (!q) return;
      qtd += q;
      soma += q * s.preco;
      linhas.push(`• ${q}x ${s.nome} (${preco(q * s.preco)})`);
    });
    const taxa = zona ? zona.taxa : 0;
    return { qtd, soma, taxa, total: soma + taxa, linhas };
  };

  const mensagemPedido = () => {
    const r = resumo();
    return [
      SITE.pedidoAbertura,
      '',
      ...r.linhas,
      '',
      `Geladões: ${preco(r.soma)}`,
      zona ? `Entrega (${zona.nome}): ${preco(r.taxa)}` : 'Entrega: a combinar',
      `Total: ${preco(r.total)}`,
      '',
      ...[].concat(SITE.pedidoFechamento || []),
    ].join('\n');
  };

  const atualizar = (id) => {
    if (id) {
      const li = $(`.flavor[data-id="${id}"]`, root);
      const q = pedido.get(id) || 0;
      $('.flavor__add', li).hidden = q > 0;
      $('.stepper', li).hidden = q === 0;
      $('.stepper__qty', li).textContent = q;
      $('.stepper__btn[data-step="1"]', li).disabled = q >= MAX;
      li.classList.toggle('is-picked', q > 0);
    }

    // Três estados: abaixo do mínimo, sem zona escolhida, pronto para enviar.
    const r = resumo();
    const faltam = Math.max(0, MINIMO - r.qtd);
    const pronto = faltam === 0 && (zona || !ZONAS.length);

    $('[data-order-count]', orderbar).textContent = geladoes(r.qtd);
    $('[data-order-detail]', orderbar).textContent = faltam
      ? `Faltam ${faltam} (mínimo ${MINIMO})`
      : pronto ? `Total ${preco(r.total)}` : `${preco(r.soma)} + entrega`;
    orderbar.classList.toggle('is-on', r.qtd > 0);
    document.body.classList.toggle('has-order', r.qtd > 0);

    rotulo.textContent = faltam || pronto ? 'Enviar pedido' : 'Escolher zona';
    $('use', enviar).setAttribute('href', faltam || pronto ? '#i-chat' : '#i-pin');
    enviar.classList.toggle('is-blocked', faltam > 0);
    enviar.setAttribute('aria-disabled', faltam > 0 ? 'true' : 'false');
    if (pronto) {
      enviar.href = linkWhats(mensagemPedido()) || '#';
      enviar.target = '_blank';
      enviar.rel = 'noopener';
    } else {
      enviar.href = '#zonas';
      enviar.removeAttribute('target');
    }
  };

  const renderCards = () => {
    if (!root) return;
    root.replaceChildren(...lista.map((s, i) => card(s, i)));
    // Quantidades já escolhidas continuam nos cards novos.
    pedido.forEach((q, id) => {
      if ($(`.flavor[data-id="${id}"]`, root)) atualizar(id);
    });
  };

  // Troca a lista inteira (chamado pelo Firebase). Sabor que saiu ou esgotou
  // com itens no pedido é removido e o cliente é avisado.
  const definirLista = (nova) => {
    lista = nova.slice();
    const disponiveis = new Set(ativos().map((s) => s.id));
    const removidos = [];
    pedido.forEach((q, id) => {
      if (!disponiveis.has(id)) {
        const antigo = (lista.find((s) => s.id === id) || {}).nome || 'um sabor';
        removidos.push(antigo);
        pedido.delete(id);
      }
    });
    renderPrecoMinimo();
    renderFaixas();
    renderCards();
    atualizar();
    if (removidos.length) showToast(`${listaPt(removidos)} esgotou e saiu do seu pedido.`, 6000);
  };
  window.DoseCardapio = { set: definirLista, get: () => lista.slice() };

  if (root) {
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-step]');
      if (!btn) return;
      const li = btn.closest('.flavor');
      const id = li.dataset.id;
      const antes = pedido.get(id) || 0;
      const depois = Math.max(0, Math.min(MAX, antes + Number(btn.dataset.step)));
      if (depois) pedido.set(id, depois); else pedido.delete(id);
      atualizar(id);

      // O botão clicado pode ter sumido: leva o foco para o controle que ficou no lugar.
      if (antes === 0 && depois > 0) $('.stepper__btn[data-step="1"]', li).focus();
      if (antes > 0 && depois === 0) $('.flavor__add', li).focus();
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
      io.observe(root);
    } else {
      root.classList.add('is-in');
    }
  }

  enviar.addEventListener('click', (e) => {
    const faltam = Math.max(0, MINIMO - resumo().qtd);
    if (faltam) {
      e.preventDefault();
      showToast(`O pedido mínimo é de ${geladoes(MINIMO)}. ${faltam === 1 ? 'Falta 1' : `Faltam ${faltam}`}.`);
      return;
    }
    if (ZONAS.length && !zona) {
      e.preventDefault();
      const caixa = $('#zonas');
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      caixa.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'center' });
      const primeiro = $('input[name="zona"]', caixa);
      if (primeiro) setTimeout(() => primeiro.focus({ preventScroll: true }), reduzir ? 0 : 450);
      showToast('Escolha a zona de entrega para calcular o total.');
      return;
    }
    if (numero) return; // o link já leva a mensagem pronta
    if (!SITE.whatsappLink) {
      e.preventDefault();
      showToast('Em breve, nosso WhatsApp por aqui.');
      return;
    }
    // Sem número, o link da bio abre a conversa vazia: copia o pedido para colar lá.
    copiar(mensagemPedido()).then((ok) => {
      showToast(ok
        ? 'Pedido copiado! Cole na conversa do WhatsApp.'
        : 'Abrimos o WhatsApp: escreva lá os sabores escolhidos.', 6000);
    });
  });

  renderPrecoMinimo();
  renderFaixas();
  renderCards();
  atualizar();

  /* ---------- Rodapé ---------- */
  $$('[data-year]').forEach((n) => { n.textContent = new Date().getFullYear(); });
})();
