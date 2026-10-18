const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

export const IconePainel = () => (
  <svg {...base}><path d="M3 13h4l3 7 4-16 3 9h4" /></svg>
)

export const IconeCalendario = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

export const IconeFicha = () => (
  <svg {...base}>
    <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </svg>
)

export const IconeMedidas = () => (
  <svg {...base}>
    <path d="M4 8h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <path d="M8 8v3M12 8v4M16 8v3" />
  </svg>
)

export const IconeDieta = () => (
  <svg {...base}>
    <path d="M7 3v8a3 3 0 0 0 6 0V3M10 11v10" />
    <path d="M17 3c2 2 2 5 0 7v11" />
  </svg>
)

export const IconeGota = () => (
  <svg {...base}><path d="M12 3s6 6.3 6 10.2A6 6 0 0 1 6 13.2C6 9.3 12 3 12 3z" /></svg>
)

export const IconePerfil = () => (
  <svg {...base}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c1.3-3.6 4-5.3 7-5.3s5.7 1.7 7 5.3" />
  </svg>
)

export const IconeMais = () => <svg {...base}><path d="M12 5v14M5 12h14" /></svg>
export const IconeLixo = () => (
  <svg {...base}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
)
export const IconeLapis = () => (
  <svg {...base}><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z" /></svg>
)
export const IconeCima = () => <svg {...base}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
export const IconeBaixo = () => <svg {...base}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
export const IconeEsquerda = () => <svg {...base}><path d="M14 6l-6 6 6 6" /></svg>
export const IconeDireita = () => <svg {...base}><path d="M10 6l6 6-6 6" /></svg>
