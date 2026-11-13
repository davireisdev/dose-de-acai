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

  window.DoseDesenho = { desenho, estilos: Object.keys(ARTES) };
})();
