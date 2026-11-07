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

  if (SABORES.length) {
    const minimo = Math.min(...SABORES.map((s) => s.preco));
    $$('[data-preco-min]').forEach((n) => { n.textContent = preco(minimo); });
  }

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

  /* ---------- Desenho do geladão (enquanto não há foto do sabor) ---------- */
  // Tubo gordinho com a ponta de cima dobrada, nó embaixo (como o geladão da foto)
  const CORPO = 'M30 32Q30 14 44 12Q50 10 56 12Q70 14 70 32V102Q70 118 50 118Q30 118 30 102Z';
  const ARTES = {
    mesclado: `<rect x="26" y="0" width="48" height="130" fill="#6A2287"/>
      <path d="M26 26C38 22 44 36 54 42C62 47 70 52 74 62V76C66 68 58 70 50 64C40 57 36 46 26 48Z" fill="#FFF4D6"/>
      <path d="M26 86C34 80 42 90 50 94C58 98 66 92 74 96V124H26Z" fill="#FFF4D6"/>
      <ellipse cx="60" cy="24" rx="6" ry="3" fill="#FFF4D6" transform="rotate(20 60 24)"/>
      <path d="M36 70C40 68 44 72 42 76C38 78 34 74 36 70Z" fill="#FFF4D6" opacity=".85"/>`,
    creme: `<rect x="26" y="0" width="48" height="130" fill="#FFF4D6"/>
      <path d="M26 22C36 18 44 28 52 34C60 40 66 38 74 42V54C66 50 58 54 50 50C42 46 34 38 26 40Z" fill="#6A2287"/>
      <path d="M26 68C34 62 44 72 54 76C62 79 68 74 74 78V92C66 90 58 94 48 90C38 86 34 80 26 84Z" fill="#6A2287"/>
      <path d="M38 102C44 98 52 102 54 108C50 113 40 112 38 102Z" fill="#6A2287" opacity=".85"/>
      <ellipse cx="60" cy="62" rx="4" ry="2.4" fill="#6A2287" opacity=".7"/>`,
    confete: `<rect x="26" y="0" width="48" height="130" fill="#6A2287"/>
      <path d="M26 44C38 38 48 54 60 56C66 57 70 54 74 56V66C66 66 60 68 52 66C42 63 36 52 26 56Z" fill="#8B3DAE" opacity=".75"/>
      <path d="M26 92C36 88 46 98 58 98C64 98 70 96 74 98V106C66 108 56 108 48 104C40 100 34 96 26 100Z" fill="#8B3DAE" opacity=".6"/>
      <circle cx="52" cy="22" r="3" fill="#f28a2e"/><circle cx="40" cy="31" r="3" fill="#FFD23F"/>
      <circle cx="60" cy="38" r="3" fill="#e5484d"/><circle cx="45" cy="49" r="3" fill="#3e8ef7"/>
      <circle cx="62" cy="62" r="3" fill="#6DBA4A"/><circle cx="38" cy="68" r="3" fill="#f28a2e"/>
      <circle cx="54" cy="78" r="3" fill="#FFD23F"/><circle cx="40" cy="90" r="3" fill="#e5484d"/>
      <circle cx="60" cy="99" r="3" fill="#3e8ef7"/><circle cx="48" cy="110" r="3" fill="#6DBA4A"/>`,
    chocolate: `<rect x="26" y="0" width="48" height="130" fill="#5b3123"/>
      <path d="M26 40C38 34 48 48 60 50C66 51 70 48 74 50V58C64 62 54 60 46 56C38 52 32 48 26 50Z" fill="#6e3d2b"/>
      <path d="M26 84C36 78 46 90 58 90C64 90 70 88 74 90V98C64 102 52 100 44 96C36 92 32 88 26 90Z" fill="#43231a" opacity=".55"/>`,
  };

  const desenho = (sabor) => {
    const clip = `clip-${sabor.id}`;
    const recheio = ARTES[sabor.arte] || ARTES.mesclado;
    return `<svg viewBox="0 0 100 140" aria-hidden="true" focusable="false">
      <defs><clipPath id="${clip}"><path d="${CORPO}"/></clipPath></defs>
      <g transform="rotate(-24 50 70)">
        <path d="M47 123L40 136Q50 141 60 136L53 123Z" fill="#C99BDB" opacity=".8"/>
        <circle cx="50" cy="121" r="4.2" fill="#2A0838"/>
        <g clip-path="url(#${clip})">${recheio}</g>
        <path d="M44 13Q50 17 56 13" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M37 32V100" stroke="#fff" stroke-opacity=".36" stroke-width="4" stroke-linecap="round"/>
        <path d="M63 34V46" stroke="#fff" stroke-opacity=".28" stroke-width="2.6" stroke-linecap="round"/>
      </g>
    </svg>`;
  };

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
  if (faixas) {
    const REPETICOES = 6; // por metade; as duas metades são iguais para o laço não pular
    SABORES.forEach((sabor) => {
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
  }

  /* ---------- Cardápio + pedido ---------- */
  const root = $('#menu-root');
  const pedido = new Map(); // id -> quantidade
  const MAX = 99;

  const icone = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;

  const card = (sabor, n) => {
    const li = document.createElement('li');
    li.className = 'flavor';
    li.dataset.id = sabor.id;
    li.dataset.arte = sabor.imagem ? 'foto' : (sabor.arte || 'mesclado');
    li.style.setProperty('--n', n);

    const arte = document.createElement('div');
    arte.className = 'flavor__art';
    if (sabor.imagem) {
      const img = document.createElement('img');
      img.src = `${SITE.pastaImagens}${sabor.imagem}-720.jpg`;
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
    SABORES.forEach((s) => {
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

  if (root) {
    SABORES.forEach((s, i) => root.append(card(s, i)));

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

  atualizar();

  /* ---------- Rodapé ---------- */
  $$('[data-year]').forEach((n) => { n.textContent = new Date().getFullYear(); });
})();
