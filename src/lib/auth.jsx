import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, definirCallbackExpiracao, limparToken, obterToken, salvarToken } from './api'

const ContextoAuth = createContext(null)

export function ProvedorAuth({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const sair = useCallback(() => {
    limparToken()
    setUsuario(null)
  }, [])

  useEffect(() => {
    definirCallbackExpiracao(() => setUsuario(null))
    if (!obterToken()) {
      setCarregando(false)
      return
    }
    api
      .get('/auth/eu')
      .then(setUsuario)
      .catch(() => limparToken())
      .finally(() => setCarregando(false))
  }, [])

  const entrar = useCallback(async (email, senha) => {
    const dados = await api.post('/auth/login', { email, senha })
    salvarToken(dados.token)
    setUsuario(dados.usuario)
  }, [])

  const cadastrar = useCallback(async (payload) => {
    const dados = await api.post('/auth/registrar', payload)
    salvarToken(dados.token)
    setUsuario(dados.usuario)
  }, [])

  const atualizarUsuario = useCallback((novo) => setUsuario(novo), [])

  return (
    <ContextoAuth.Provider
      value={{ usuario, carregando, entrar, cadastrar, sair, atualizarUsuario }}
    >
      {children}
    </ContextoAuth.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(ContextoAuth)
  if (!contexto) throw new Error('useAuth precisa estar dentro de ProvedorAuth')
  return contexto
}
