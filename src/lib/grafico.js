/** Parametros visuais compartilhados pelos graficos (tema escuro do app). */
export const COR_SERIE = '#1cb894'
export const COR_SERIE_2 = '#58a6ff'
export const COR_GRADE = '#272c37'
export const COR_TEXTO_EIXO = '#9aa3b2'

export const eixo = {
  stroke: COR_GRADE,
  tick: { fill: COR_TEXTO_EIXO, fontSize: 11 },
  tickLine: false,
}

export const estiloDica = {
  contentStyle: {
    background: '#1e222b',
    border: '1px solid #272c37',
    borderRadius: 10,
    fontSize: 13,
  },
  labelStyle: { color: '#e8ebf0', fontWeight: 600 },
  itemStyle: { color: '#9aa3b2' },
}
