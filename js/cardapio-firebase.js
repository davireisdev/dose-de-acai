// Cardápio em tempo real: lê a coleção "sabores" e entrega ao site (window.DoseCardapio).
// Se o Firebase não estiver configurado ou falhar, o site fica com o js/menu.js.
import { app, configurado, COLECAO, docParaSabor } from './firebase-init.js';
import { getFirestore, collection, doc, query, orderBy, onSnapshot }
  from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

if (configurado && window.DoseCardapio) {
  const db = getFirestore(app);
  const q = query(collection(db, COLECAO), orderBy('ordem'), orderBy('nome'));
  onSnapshot(q, (snap) => {
    const sabores = snap.docs.map(docParaSabor).filter((s) => s.nome && s.preco > 0);
    // Coleção vazia (antes da primeira importação) mantém a reserva do menu.js.
    if (sabores.length) window.DoseCardapio.set(sabores);
  }, (erro) => {
    console.warn('Cardápio do Firebase indisponível; usando o menu.js.', erro);
  });

  // Loja aberta ou fechada (config/loja). Sem documento = aberta.
  onSnapshot(doc(db, 'config', 'loja'), (snap) => {
    if (window.DoseLoja) window.DoseLoja.set(snap.exists() ? snap.data() : {});
  }, (erro) => console.warn('Estado da loja indisponível; considerando aberta.', erro));
}
