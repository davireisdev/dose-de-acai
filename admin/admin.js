// Painel da Dose de Açaí: login da dona e cadastro dos sabores no Firestore.
import { app, configurado, COLECAO, ESTILOS, docParaSabor } from '../js/firebase-init.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, setPersistence, browserLocalPersistence }
  from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, collection, doc, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, writeBatch, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const { desenho, estiloDe, padroes } = window.DoseDesenho;

const telas = { config: $('#tela-config'), login: $('#tela-login'), painel: $('#tela-painel') };
const mostrar = (qual) => Object.entries(telas).forEach(([k, el]) => { el.hidden = k !== qual; });

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const preco = (v) => (Number.isInteger(v) ? fmt.format(v).replace(/,00$/, '') : fmt.format(v)).replace(/[  ]/g, ' ');

const toast = $('#toast');
let toastTimer;
const aviso = (msg, ms = 3600) => {
  toast.textContent = msg;
  toast.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-on'), ms);
};

if (!configurado) {
  mostrar('config');
} else {
  iniciar();
}

function iniciar() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const colecao = collection(db, COLECAO);
  let sabores = [];
  let pararLista = null;

  /* ---------- Login ---------- */
  const formLogin = $('#form-login');
  const erroLogin = $('#login-erro');
  const mensagens = {
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/invalid-email': 'Esse e-mail não parece válido.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
    'auth/network-request-failed': 'Sem conexão. Confira a internet e tente de novo.',
    'permission-denied': 'Esta conta não tem permissão para mexer no cardápio.',
  };
  const textoErro = (e) => mensagens[e && e.code] || 'Não deu certo. Tente de novo.';

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    erroLogin.hidden = true;
    const botao = $('button[type="submit"]', formLogin);
    botao.disabled = true;
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, formLogin.email.value.trim(), formLogin.senha.value);
    } catch (err) {
      erroLogin.textContent = textoErro(err);
      erroLogin.hidden = false;
    } finally {
      botao.disabled = false;
    }
  });

  $('#esqueci').addEventListener('click', async () => {
    const email = formLogin.email.value.trim();
    if (!email) {
      erroLogin.textContent = 'Digite o e-mail da conta e toque de novo em "Esqueci minha senha".';
      erroLogin.hidden = false;
      formLogin.email.focus();
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      aviso('Enviamos um e-mail para redefinir a senha.', 6000);
    } catch (err) {
      erroLogin.textContent = textoErro(err);
      erroLogin.hidden = false;
    }
  });

  $('#sair').addEventListener('click', () => signOut(auth));

  onAuthStateChanged(auth, (user) => {
    $('#sair').hidden = !user;
    if (user) {
      mostrar('painel');
      escutar();
      escutarLoja();
    } else {
      if (pararLista) { pararLista(); pararLista = null; }
      if (pararLoja) { pararLoja(); pararLoja = null; }
      formLogin.reset();
      mostrar('login');
    }
  });

  /* ---------- Loja aberta / fechada ---------- */
  const refLoja = doc(db, 'config', 'loja');
  const caixaLoja = $('#loja');
  const campoVolta = $('#loja-volta');
  const botaoLoja = $('#loja-alternar');
  let lojaFechada = false;
  let pararLoja = null;

  const desenharLoja = (d) => {
    lojaFechada = Boolean(d && d.fechado);
    caixaLoja.classList.toggle('is-closed', lojaFechada);
    $('#loja-estado').textContent = lojaFechada ? 'Loja fechada' : 'Loja aberta';
    $('#loja-ajuda').textContent = lojaFechada
      ? 'O site mostra "Estamos fechados" e os clientes deixam o pedido agendado.'
      : 'Os clientes fazem pedidos normalmente.';
    botaoLoja.textContent = lojaFechada ? 'Abrir a loja' : 'Fechar a loja';
    botaoLoja.className = 'btn ' + (lojaFechada ? 'btn--accent' : 'btn--ghost');
    if (document.activeElement !== campoVolta) campoVolta.value = (d && d.volta) || '';
  };
  const escutarLoja = () => {
    if (pararLoja) return;
    pararLoja = onSnapshot(refLoja, (snap) => desenharLoja(snap.exists() ? snap.data() : {}), (err) => {
      console.error(err);
      aviso(textoErro(err), 6000);
    });
  };
  const gravarLoja = async (fechado) => {
    await setDoc(refLoja, { fechado, volta: campoVolta.value.trim().slice(0, 80), atualizadoEm: serverTimestamp() });
  };
  botaoLoja.addEventListener('click', async () => {
    botaoLoja.disabled = true;
    const fechar = !lojaFechada; // guarda antes: o estado muda assim que o banco responde
    try {
      await gravarLoja(fechar);
      aviso(fechar ? 'Loja fechada. O site já avisa os clientes.' : 'Loja aberta de novo.');
    } catch (err) {
      console.error(err);
      aviso(textoErro(err), 6000);
    } finally {
      botaoLoja.disabled = false;
    }
  });
  campoVolta.addEventListener('change', async () => {
    try { await gravarLoja(lojaFechada); aviso('Aviso de volta salvo.'); } catch (err) { console.error(err); aviso(textoErro(err), 6000); }
  });

  /* ---------- Lista ---------- */
  const lista = $('#lista');
  const vazio = $('#vazio');

  function escutar() {
    if (pararLista) return;
    const q = query(colecao, orderBy('ordem'), orderBy('nome'));
    pararLista = onSnapshot(q, (snap) => {
      sabores = snap.docs.map(docParaSabor);
      render();
    }, (err) => {
      console.error(err);
      aviso(textoErro(err), 6000);
    });
  }

  const icone = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;

  function render() {
    vazio.hidden = sabores.length > 0;
    lista.replaceChildren(...sabores.map((s, i) => {
      const li = document.createElement('li');
      li.className = 'sabor' + (s.ativo ? '' : ' is-out');
      li.dataset.id = s.id;
      li.innerHTML = `
        <div class="sabor__art">${s.foto ? `<img src="${s.foto}" alt="">` : desenho(s)}</div>
        <div class="sabor__body">
          <div class="sabor__name">${escapar(s.nome)}</div>
          <span class="sabor__price">${preco(s.preco)}</span>
          <span class="sabor__status">${s.ativo ? 'Disponível' : 'Esgotado'}</span>
        </div>
        <div class="sabor__order">
          <button type="button" class="iconbtn" data-acao="subir" aria-label="Subir ${escapar(s.nome)}" ${i === 0 ? 'disabled' : ''}>${icone('i-up')}</button>
          <button type="button" class="iconbtn" data-acao="descer" aria-label="Descer ${escapar(s.nome)}" ${i === sabores.length - 1 ? 'disabled' : ''}>${icone('i-down')}</button>
        </div>
        <div class="sabor__ctrl">
          <button type="button" class="btn ${s.ativo ? 'btn--ghost' : 'btn--accent'}" data-acao="alternar">${s.ativo ? 'Marcar esgotado' : 'Marcar disponível'}</button>
          <button type="button" class="btn btn--ghost" data-acao="editar">${icone('i-pen')} Editar</button>
          <button type="button" class="btn btn--ghost btn--danger" data-acao="excluir">${icone('i-trash')} Excluir</button>
        </div>`;
      return li;
    }));
  }

  const escapar = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  lista.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-acao]');
    if (!btn) return;
    const id = btn.closest('.sabor').dataset.id;
    const s = sabores.find((x) => x.id === id);
    if (!s) return;
    btn.disabled = true;
    try {
      if (btn.dataset.acao === 'alternar') {
        await updateDoc(doc(db, COLECAO, id), { ativo: !s.ativo, atualizadoEm: serverTimestamp() });
        aviso(s.ativo ? `${s.nome} marcado como esgotado.` : `${s.nome} de volta ao cardápio.`);
      } else if (btn.dataset.acao === 'excluir') {
        if (!confirm(`Excluir "${s.nome}" do cardápio? Isso não desfaz.`)) return;
        await deleteDoc(doc(db, COLECAO, id));
        aviso(`${s.nome} excluído.`);
      } else if (btn.dataset.acao === 'editar') {
        abrirForm(s);
      } else {
        await mover(s, btn.dataset.acao === 'subir' ? -1 : 1);
      }
    } catch (err) {
      console.error(err);
      aviso(textoErro(err), 6000);
    } finally {
      btn.disabled = false;
    }
  });

  // Troca de posição com o vizinho e grava a ordem de todos (0, 1, 2...).
  async function mover(s, delta) {
    const i = sabores.indexOf(s);
    const j = i + delta;
    if (j < 0 || j >= sabores.length) return;
    const nova = sabores.slice();
    [nova[i], nova[j]] = [nova[j], nova[i]];
    const batch = writeBatch(db);
    nova.forEach((x, k) => batch.update(doc(db, COLECAO, x.id), { ordem: k }));
    await batch.commit();
  }

  /* ---------- Importar os sabores do site (menu.js) ---------- */
  $('#importar').addEventListener('click', async (e) => {
    e.target.disabled = true;
    try {
      const batch = writeBatch(db);
      const reserva = typeof SABORES === 'undefined' ? [] : SABORES; // de ../js/menu.js
      reserva.forEach((s, k) => {
        batch.set(doc(colecao), { nome: s.nome, preco: s.preco, arte: s.arte || 'mesclado', visual: (ESTILOS.find((e) => e.id === (s.arte || 'mesclado')) || ESTILOS[0]).visual, ativo: true, ordem: k, atualizadoEm: serverTimestamp() });
      });
      await batch.commit();
      aviso('Sabores importados. Eles já estão no site.');
    } catch (err) {
      console.error(err);
      aviso(textoErro(err), 6000);
    } finally {
      e.target.disabled = false;
    }
  });

  /* ---------- Formulário (novo / editar) ---------- */
  const modal = $('#modal');
  const form = $('#form-sabor');
  const erroForm = $('#sabor-erro');
  const previa = $('#foto-previa');
  const btnRemoverFoto = $('#foto-remover');
  let editando = null;
  let foto = '';

  const COR_NOMES = ['base', 'onda', 'pintas'];
  const visualAtual = () => ({
    padrao: form.padrao.value || 'ondas',
    base: form.base.value.toUpperCase(),
    onda: form.onda.value.toUpperCase(),
    pintas: form.pintas.value.toUpperCase(),
  });
  const mesmoVisual = (a, b) => a.padrao === b.padrao && COR_NOMES.every((k) => a[k].toUpperCase() === b[k].toUpperCase());

  $('#padroes').innerHTML = padroes.map((p, i) => `
    <label class="padrao"><input type="radio" name="padrao" value="${p.id}" ${i === 0 ? 'checked' : ''}>${p.nome}</label>`).join('');
  $('#artes').innerHTML = ESTILOS.map((e) => `
    <label class="arte">
      <input type="radio" name="modelo" value="${e.id}">
      ${desenho({ id: 'modelo-' + e.id, visual: e.visual })}
      <span>${e.nome}</span>
    </label>`).join('');

  // Prévia ao vivo e campos de cor que fazem sentido para o padrão escolhido.
  const atualizarPrevia = () => {
    const v = visualAtual();
    const sabor = { id: 'previa', visual: v };
    const prev = $('#visual-previa');
    prev.style.setProperty('--plate', estiloDe(sabor).plate);
    prev.innerHTML = desenho(sabor);
    $$('.cor[data-so]', form).forEach((el) => { el.hidden = el.dataset.so !== v.padrao; });
    // destaca o modelo pronto igual ao visual atual
    $$('.arte input', form).forEach((r) => { r.checked = mesmoVisual(ESTILOS.find((e) => e.id === r.value).visual, v); });
  };
  const aplicarVisual = (v) => {
    form.padrao.value = v.padrao;
    form.base.value = v.base;
    form.onda.value = v.onda;
    form.pintas.value = v.pintas;
    atualizarPrevia();
  };
  form.addEventListener('input', (e) => {
    if (['padrao', 'base', 'onda', 'pintas'].includes(e.target.name)) atualizarPrevia();
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'modelo') aplicarVisual(ESTILOS.find((x) => x.id === e.target.value).visual);
  });

  const mostrarFoto = () => {
    previa.hidden = !foto;
    btnRemoverFoto.hidden = !foto;
    if (foto) previa.src = foto;
  };

  function abrirForm(s) {
    editando = s || null;
    form.reset();
    erroForm.hidden = true;
    $('#modal-titulo').textContent = s ? 'Editar sabor' : 'Novo sabor';
    if (s) {
      form.nome.value = s.nome;
      form.preco.value = String(s.preco).replace('.', ',');
      form.ativo.checked = s.ativo;
    }
    const inicial = s ? (s.visual || (ESTILOS.find((e) => e.id === s.arte) || ESTILOS[0]).visual) : ESTILOS[0].visual;
    aplicarVisual(inicial);
    foto = s ? s.foto : '';
    mostrarFoto();
    modal.showModal();
    form.nome.focus();
  }

  $('#novo').addEventListener('click', () => abrirForm(null));
  $('#cancelar').addEventListener('click', () => modal.close());
  btnRemoverFoto.addEventListener('click', () => { foto = ''; form.arquivo.value = ''; mostrarFoto(); });

  form.arquivo.addEventListener('change', async () => {
    const arquivo = form.arquivo.files[0];
    if (!arquivo) return;
    try {
      foto = await reduzirFoto(arquivo);
      mostrarFoto();
    } catch (err) {
      console.error(err);
      erroForm.textContent = 'Não consegui abrir essa foto. Tente outra.';
      erroForm.hidden = false;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erroForm.hidden = true;
    const nome = form.nome.value.trim();
    const valor = Number(form.preco.value.trim().replace(/[R$\s]/g, '').replace(',', '.'));
    if (!nome) return falhar('Dê um nome ao sabor.');
    if (nome.length > 40) return falhar('O nome pode ter no máximo 40 letras.');
    if (!(valor > 0) || valor > 1000) return falhar('Digite um preço válido, como 6 ou 6,50.');
    const dados = {
      nome,
      preco: Math.round(valor * 100) / 100,
      arte: (ESTILOS.find((e) => mesmoVisual(e.visual, visualAtual())) || { id: 'personalizado' }).id,
      visual: visualAtual(),
      foto,
      ativo: form.ativo.checked,
      ordem: editando ? editando.ordem : sabores.length,
      atualizadoEm: serverTimestamp(),
    };
    $('#salvar').disabled = true;
    try {
      if (editando) await updateDoc(doc(db, COLECAO, editando.id), dados);
      else await addDoc(colecao, dados);
      modal.close();
      aviso(editando ? 'Sabor atualizado.' : 'Sabor adicionado ao cardápio.');
    } catch (err) {
      console.error(err);
      falhar(textoErro(err));
    } finally {
      $('#salvar').disabled = false;
    }
  });

  function falhar(msg) {
    erroForm.textContent = msg;
    erroForm.hidden = false;
  }
}

// Reduz a foto no navegador para caber no documento (quadrado de 640px, JPEG).
function reduzirFoto(arquivo, lado = 640) {
  return new Promise((resolver, rejeitar) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const c = document.createElement('canvas');
      c.width = lado; c.height = lado;
      const ctx = c.getContext('2d');
      // Corta o centro num quadrado, como o card do site mostra.
      const m = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, lado, lado);
      let q = 0.82;
      let out = c.toDataURL('image/jpeg', q);
      while (out.length > 300000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
      resolver(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rejeitar(new Error('imagem inválida')); };
    img.src = url;
  });
}
