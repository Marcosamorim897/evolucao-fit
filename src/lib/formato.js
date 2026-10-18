export const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export const REFEICOES = [
  { chave: 'cafe', rotulo: 'Café da manhã' },
  { chave: 'lanche', rotulo: 'Lanche' },
  { chave: 'almoco', rotulo: 'Almoço' },
  { chave: 'cafe_tarde', rotulo: 'Café da tarde' },
  { chave: 'jantar', rotulo: 'Jantar' },
  { chave: 'ceia', rotulo: 'Ceia' },
]

/** Data de hoje no formato YYYY-MM-DD usando o fuso do aparelho (não UTC). */
export function hojeISO() {
  return paraISO(new Date())
}

export function paraISO(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function deISO(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export function dataCurta(iso) {
  const d = deISO(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function dataLonga(iso) {
  const d = deISO(iso)
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`
}

export function numero(valor, casas = 1) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas,
  })
}

export function litros(ml) {
  return `${(ml / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} L`
}

/** Converte "" em null e número em Number, para enviar ao backend. */
export function valorOuNulo(texto) {
  if (texto === '' || texto === null || texto === undefined) return null
  const n = Number(String(texto).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
