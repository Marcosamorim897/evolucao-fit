import { useState } from 'react'
import { Campo, Cartao, Erro, Sucesso } from '../components/Interface'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { valorOuNulo } from '../lib/formato'

export default function Perfil() {
  const { usuario, atualizarUsuario, sair } = useAuth()
  const [form, setForm] = useState({
    nome: usuario.nome,
    altura_cm: usuario.altura_cm ?? '',
    meta_agua_ml: usuario.meta_agua_ml,
    meta_calorias: usuario.meta_calorias,
    meta_proteina_g: usuario.meta_proteina_g,
  })
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)

  const alterar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setAviso('')
    setEnviando(true)
    try {
      const atualizado = await api.put('/auth/eu', {
        nome: form.nome.trim(),
        altura_cm: valorOuNulo(form.altura_cm),
        meta_agua_ml: valorOuNulo(form.meta_agua_ml),
        meta_calorias: valorOuNulo(form.meta_calorias),
        meta_proteina_g: valorOuNulo(form.meta_proteina_g),
      })
      atualizarUsuario(atualizado)
      setAviso('Metas atualizadas.')
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <header className="cabecalho-pagina">
        <div>
          <h1>Perfil e metas</h1>
          <p className="subtitulo">{usuario.email}</p>
        </div>
      </header>

      <Cartao titulo="Minhas metas">
        <form className="empilhado" onSubmit={enviar}>
          <div className="grade grade-2">
            <Campo rotulo="Nome" value={form.nome} onChange={alterar('nome')} required minLength={2} />
            <Campo rotulo="Altura (cm)" type="number" min="100" max="250" step="0.5" value={form.altura_cm} onChange={alterar('altura_cm')} />
          </div>
          <div className="grade grade-3">
            <Campo rotulo="Meta de água (ml/dia)" type="number" min="200" max="10000" step="100" value={form.meta_agua_ml} onChange={alterar('meta_agua_ml')} />
            <Campo rotulo="Meta de calorias (kcal/dia)" type="number" min="500" max="10000" step="50" value={form.meta_calorias} onChange={alterar('meta_calorias')} />
            <Campo rotulo="Meta de proteína (g/dia)" type="number" min="20" max="500" step="5" value={form.meta_proteina_g} onChange={alterar('meta_proteina_g')} />
          </div>
          <Erro>{erro}</Erro>
          <Sucesso>{aviso}</Sucesso>
          <button type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar metas'}</button>
        </form>
      </Cartao>

      <Cartao titulo="Conta">
        <p className="vazio">Você está conectado como {usuario.email}.</p>
        <button type="button" className="secundario" onClick={sair}>Sair da conta</button>
      </Cartao>
    </>
  )
}
