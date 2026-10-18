const CHAVE_TOKEN = 'evolucaofit_token'

let aoExpirarSessao = () => {}

export function definirCallbackExpiracao(fn) {
  aoExpirarSessao = fn
}

export function obterToken() {
  try {
    return localStorage.getItem(CHAVE_TOKEN)
  } catch {
    return null
  }
}

export function salvarToken(token) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token)
  } catch {
    /* modo privado: segue so em memoria */
  }
}

export function limparToken() {
  try {
    localStorage.removeItem(CHAVE_TOKEN)
  } catch {
    /* ignora */
  }
}

async function pedir(metodo, caminho, corpo) {
  const token = obterToken()
  const resposta = await fetch(`/api${caminho}`, {
    method: metodo,
    headers: {
      ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  })

  if (resposta.status === 401) {
    limparToken()
    aoExpirarSessao()
    throw new Error('Sessão expirada. Entre novamente.')
  }
  if (resposta.status === 204) return null
  const texto = await resposta.text()
  const dados = texto ? JSON.parse(texto) : null
  if (!resposta.ok) {
    throw new Error(mensagemDeErro(dados) || `Falha na requisição (${resposta.status}).`)
  }
  return dados
}

function mensagemDeErro(dados) {
  if (!dados) return null
  const detalhe = dados.detail
  if (typeof detalhe === 'string') return detalhe
  if (Array.isArray(detalhe) && detalhe.length) {
    const primeiro = detalhe[0]
    const campo = Array.isArray(primeiro.loc) ? primeiro.loc[primeiro.loc.length - 1] : ''
    return campo ? `${campo}: ${primeiro.msg}` : primeiro.msg
  }
  return null
}

export const api = {
  get: (caminho) => pedir('GET', caminho),
  post: (caminho, corpo) => pedir('POST', caminho, corpo ?? {}),
  put: (caminho, corpo) => pedir('PUT', caminho, corpo ?? {}),
  del: (caminho) => pedir('DELETE', caminho),
}
