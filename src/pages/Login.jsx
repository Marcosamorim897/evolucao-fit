import { useState } from 'react'
import { Campo, Erro } from '../components/Interface'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { entrar, cadastrar } = useAuth()
  const [modo, setModo] = useState('entrar')
  const [form, setForm] = useState({ nome: '', email: '', senha: '', codigo_convite: '' })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const alterar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        await entrar(form.email, form.senha)
      } else {
        await cadastrar({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          codigo_convite: form.codigo_convite || null,
        })
      }
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="tela-login">
      <div className="caixa-login">
        <div className="marca"><img src="/icone.svg" alt="" /> EvoluçãoFit</div>
        <p className="frase">Treinos, medidas, alimentação e água — tudo num lugar.</p>

        <form className="cartao empilhado" onSubmit={enviar}>
          <div className="chips">
            <button
              type="button"
              className={`chip ${modo === 'entrar' ? 'ativo' : ''}`}
              onClick={() => setModo('entrar')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`chip ${modo === 'criar' ? 'ativo' : ''}`}
              onClick={() => setModo('criar')}
            >
              Criar conta
            </button>
          </div>

          {modo === 'criar' && (
            <Campo
              rotulo="Nome"
              name="name"
              autoComplete="name"
              autoCapitalize="words"
              value={form.nome}
              onChange={alterar('nome')}
              required
              minLength={2}
            />
          )}
          <Campo
            rotulo="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={alterar('email')}
            required
          />
          <Campo
            rotulo="Senha"
            type="password"
            name="password"
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            value={form.senha}
            onChange={alterar('senha')}
            required
            minLength={6}
          />
          {modo === 'criar' && (
            <Campo
              rotulo="Código de convite (se o app pedir)"
              name="codigo_convite"
              autoComplete="off"
              value={form.codigo_convite}
              onChange={alterar('codigo_convite')}
            />
          )}

          <Erro>{erro}</Erro>
          <button type="submit" disabled={enviando}>
            {enviando ? 'Enviando…' : modo === 'entrar' ? 'Entrar' : 'Criar minha conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
