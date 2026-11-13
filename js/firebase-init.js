// Ponto único de carregamento do Firebase (versão fixa do SDK).
// Para atualizar o SDK, troque a versão só aqui.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { FIREBASE_CONFIG } from './firebase-config.js';

export const configurado = Boolean(FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.apiKey);
export const app = configurado ? initializeApp(FIREBASE_CONFIG) : null;

export const COLECAO = 'sabores';
export const ARTES = ['mesclado', 'creme', 'confete', 'chocolate'];

// Converte um documento do Firestore no formato que o site já entende.
export const docParaSabor = (snap) => {
  const d = snap.data();
  return {
    id: snap.id,
    nome: String(d.nome || ''),
    preco: Number(d.preco) || 0,
    arte: ARTES.includes(d.arte) ? d.arte : 'mesclado',
    foto: typeof d.foto === 'string' && d.foto.startsWith('data:image/') ? d.foto : '',
    ativo: d.ativo !== false,
    ordem: Number(d.ordem) || 0,
  };
};
