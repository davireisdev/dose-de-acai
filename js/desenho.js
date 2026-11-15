/* Desenho do geladão usado no site e no painel (window.DoseDesenho).
   Sem foto, cada sabor mostra este tubo com o recheio do estilo escolhido. */
(() => {
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

  // Recheio ondulado genérico: cor de fundo + ondas numa segunda cor (+ pintinhas opcionais)
  const ondas = (base, onda, pintas = '') => `<rect x="26" y="0" width="48" height="130" fill="${base}"/>
      <path d="M26 22C36 18 44 28 52 34C60 40 66 38 74 42V54C66 50 58 54 50 50C42 46 34 38 26 40Z" fill="${onda}"/>
      <path d="M26 68C34 62 44 72 54 76C62 79 68 74 74 78V92C66 90 58 94 48 90C38 86 34 80 26 84Z" fill="${onda}"/>
      <path d="M38 102C44 98 52 102 54 108C50 113 40 112 38 102Z" fill="${onda}" opacity=".85"/>${pintas}`;
  const pintas = (cor, r = 2.2) => [[40, 30], [58, 28], [48, 58], [62, 64], [38, 80], [56, 98], [44, 112]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${cor}"/>`).join('');

  Object.assign(ARTES, {
    acai: ondas('#3B0A52', '#7A2FA6'),
    morango: ondas('#F2557F', '#FFF4D6', pintas('#C2284F')),
    maracuja: ondas('#FFC93C', '#FF9F1C', pintas('#5A2A00', 1.6)),
    coco: ondas('#FFF4D6', '#EADCC0', pintas('#FFFFFF', 2.6)),
    limao: ondas('#A9D83F', '#E9F7A8'),
    manga: ondas('#FFB020', '#FF7A1A'),
    uva: ondas('#5B2A86', '#A06CD5'),
    cafe: ondas('#7A4B2A', '#D9B48F'),
    pacoca: ondas('#D9A760', '#A9702E', pintas('#8B5A24', 2)),
  });

  // Estilos prontos: nome na lista, cor do fundo do cartão e cores da faixa do topo.
  const ESTILOS = [
    { id: 'mesclado', nome: 'Mesclado', plate: '#FFD23F', rbBg: '#FFF1D0', rbFg: '#4A1663' },
    { id: 'creme', nome: 'Creme', plate: '#6A2287', rbBg: '#FFFFFF', rbFg: '#7A2FA6' },
    { id: 'confete', nome: 'Confete', plate: '#6DBA4A', rbBg: '#7A2FA6', rbFg: '#FFF6E0' },
    { id: 'chocolate', nome: 'Chocolate', plate: '#C99BDB', rbBg: '#5A2E1A', rbFg: '#FFE2C2' },
    { id: 'acai', nome: 'Açaí', plate: '#FFD23F', rbBg: '#3B0A52', rbFg: '#FFE27A' },
    { id: 'morango', nome: 'Morango', plate: '#6A2287', rbBg: '#F2557F', rbFg: '#FFF4D6' },
    { id: 'maracuja', nome: 'Maracujá', plate: '#6A2287', rbBg: '#FFD23F', rbFg: '#5A2A00' },
    { id: 'coco', nome: 'Coco', plate: '#6DBA4A', rbBg: '#FFFFFF', rbFg: '#2F6B2A' },
    { id: 'limao', nome: 'Limão', plate: '#6A2287', rbBg: '#8FCB3A', rbFg: '#1E3A0F' },
    { id: 'manga', nome: 'Manga', plate: '#C99BDB', rbBg: '#FFB020', rbFg: '#4A2300' },
    { id: 'uva', nome: 'Uva', plate: '#FFD23F', rbBg: '#5B2A86', rbFg: '#F3E5FF' },
    { id: 'cafe', nome: 'Café', plate: '#FFD23F', rbBg: '#7A4B2A', rbFg: '#FFE2C2' },
    { id: 'pacoca', nome: 'Paçoca', plate: '#6A2287', rbBg: '#D9A760', rbFg: '#3E2410' },
  ];
  const estilo = (id) => ESTILOS.find((e) => e.id === id) || ESTILOS[0];

  /* ---------- Visual montado pela dona: padrão + cores ---------- */
  const PADROES = [
    { id: 'ondas', nome: 'Ondas' },
    { id: 'liso', nome: 'Liso' },
    { id: 'pintas', nome: 'Pintinhas' },
    { id: 'confete', nome: 'Confete' },
  ];
  const ehCor = (c) => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);

  // Visual de cada modelo pronto (ponto de partida para a dona ajustar).
  const VISUAIS = {
    mesclado: ['ondas', '#6A2287', '#FFF4D6'], creme: ['ondas', '#FFF4D6', '#6A2287'],
    confete: ['confete', '#6A2287', '#8B3DAE'], chocolate: ['ondas', '#5B3123', '#6E3D2B'],
    acai: ['ondas', '#3B0A52', '#7A2FA6'], morango: ['ondas', '#F2557F', '#FFF4D6'],
    maracuja: ['ondas', '#FFC93C', '#FF9F1C'], coco: ['ondas', '#FFF4D6', '#EADCC0'],
    limao: ['ondas', '#A9D83F', '#E9F7A8'], manga: ['ondas', '#FFB020', '#FF7A1A'],
    uva: ['ondas', '#5B2A86', '#A06CD5'], cafe: ['ondas', '#7A4B2A', '#D9B48F'],
    pacoca: ['ondas', '#D9A760', '#A9702E'],
  };
  const visualDe = ([padrao, base, onda]) => ({ padrao, base, onda, pintas: '#FFF4D6' });
  ESTILOS.forEach((e) => { e.visual = visualDe(VISUAIS[e.id]); });

  // Aceita só visual bem formado (vem do banco); devolve null se estiver quebrado.
  const visualValido = (v) => (v && typeof v === 'object' && ehCor(v.base)
    ? { padrao: PADROES.some((p) => p.id === v.padrao) ? v.padrao : 'ondas', base: v.base, onda: ehCor(v.onda) ? v.onda : v.base, pintas: ehCor(v.pintas) ? v.pintas : '#FFF4D6' }
    : null);

  // Contraste (WCAG) para escolher cor de texto e cor do cartão sozinhos.
  const lum = (h) => {
    const n = parseInt(h.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const textoSobre = (bg) => (contraste(bg, '#2A1238') >= contraste(bg, '#FFF6E0') ? '#2A1238' : '#FFF6E0');
  const CARTOES = ['#FFD23F', '#6A2287', '#6DBA4A', '#C99BDB'];
  const cartaoPara = (base) => CARTOES.reduce((m, c) => (contraste(c, base) > contraste(m, base) ? c : m));

  const CONFETES = ['#f28a2e', '#FFD23F', '#e5484d', '#3e8ef7', '#6DBA4A'];
  const recheioVisual = (v) => {
    const fundo = `<rect x="26" y="0" width="48" height="130" fill="${v.base}"/>`;
    if (v.padrao === 'liso') return fundo;
    if (v.padrao === 'pintas') {
      const pts = [[40, 24], [58, 30], [46, 44], [62, 54], [38, 62], [54, 72], [44, 86], [60, 94], [40, 106], [54, 112]];
      return fundo + pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.8" fill="${v.pintas}"/>`).join('');
    }
    if (v.padrao === 'confete') {
      const pts = [[52, 22], [40, 31], [60, 38], [45, 49], [62, 62], [38, 68], [54, 78], [40, 90], [60, 99], [48, 110]];
      return fundo + pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="3" fill="${CONFETES[i % CONFETES.length]}"/>`).join('');
    }
    return ondas(v.base, v.onda);
  };

  // Cores do cartão e da faixa do topo para um sabor (visual novo ou modelo antigo).
  const estiloDe = (sabor) => {
    const v = visualValido(sabor.visual);
    if (v) return { plate: cartaoPara(v.base), rbBg: v.base, rbFg: textoSobre(v.base) };
    return estilo(sabor.arte);
  };

  const desenho = (sabor) => {
    const clip = `clip-${sabor.id}`;
    const v = visualValido(sabor.visual);
    const recheio = v ? recheioVisual(v) : (ARTES[sabor.arte] || ARTES.mesclado);
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

  window.DoseDesenho = { desenho, estilos: ESTILOS, estilo, estiloDe, padroes: PADROES, visualValido, ehCor };
})();
