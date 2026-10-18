import { useCallback, useEffect, useState } from 'react'
import { Campo, Carregando, Cartao, Erro, Modal } from '../components/Interface'
import { IconeBaixo, IconeCima, IconeLapis, IconeLixo, IconeMais } from '../components/Icones'
import { api } from '../lib/api'
import { numero, valorOuNulo } from '../lib/formato'

const EXERCICIO_VAZIO = {
  nome: '',
  grupo_muscular: '',
  series: 3,
  repeticoes: '10',
  carga_kg: '',
  descanso_seg: '',
  observacoes: '',
}

const FICHA_VAZIA = { nome: '', foco: '', observacoes: '', ativa: true, exercicios: [{ ...EXERCICIO_VAZIO }] }

export default function Fichas() {
  const [fichas, setFichas] = useState(null)
  const [erro, setErro] = useState('')
  const [editando, setEditando] = useState(null) // { id|null, form }

  const carregar = useCallback(() => {
    api.get('/fichas').then(setFichas).catch((e) => setErro(e.message))
  }, [])

  useEffect(carregar, [carregar])

  function abrirNova() {
    setEditando({ id: null, form: { ...FICHA_VAZIA, exercicios: [{ ...EXERCICIO_VAZIO }] } })
  }

  function abrirEdicao(ficha) {
    setEditando({
      id: ficha.id,
      form: {
        nome: ficha.nome,
        foco: ficha.foco ?? '',
        observacoes: ficha.observacoes ?? '',
        ativa: ficha.ativa,
        exercicios: ficha.exercicios.map((ex) => ({
          nome: ex.nome,
          grupo_muscular: ex.grupo_muscular ?? '',
          series: ex.series,
          repeticoes: ex.repeticoes,
          carga_kg: ex.carga_kg ?? '',
          descanso_seg: ex.descanso_seg ?? '',
          observacoes: ex.observacoes ?? '',
        })),
      },
    })
  }

  async function excluir(ficha) {
    if (!confirm(`Excluir a ficha "${ficha.nome}"? Os treinos já registrados continuam no histórico.`)) return
    try {
      await api.del(`/fichas/${ficha.id}`)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  if (!fichas) return <Carregando />

  return (
    <>
      <header className="cabecalho-pagina">
        <div>
          <h1>Fichas de treino</h1>
          <p className="subtitulo">Monte seus treinos A, B, C e use-os para registrar o dia.</p>
        </div>
        <button type="button" onClick={abrirNova} className="linha"><IconeMais /> Nova ficha</button>
      </header>

      <Erro>{erro}</Erro>

      {fichas.length === 0 && (
        <Cartao>
          <p className="vazio">Você ainda não tem fichas. Crie a primeira com o botão “Nova ficha”.</p>
        </Cartao>
      )}

      <div className="empilhado">
        {fichas.map((ficha) => (
          <Cartao
            key={ficha.id}
            titulo={ficha.nome}
            acao={
              <div className="linha">
                <button type="button" className="secundario icone" title="Editar" onClick={() => abrirEdicao(ficha)}>
                  <IconeLapis />
                </button>
                <button type="button" className="perigo icone" title="Excluir" onClick={() => excluir(ficha)}>
                  <IconeLixo />
                </button>
              </div>
            }
          >
            <p className="subtitulo" style={{ marginTop: -6, marginBottom: 10 }}>
              {ficha.foco || 'Sem foco definido'}
              {!ficha.ativa && ' · arquivada'}
            </p>
            {ficha.exercicios.length === 0 ? (
              <p className="vazio">Nenhum exercício nesta ficha.</p>
            ) : (
              <div className="tabela-rolagem">
                <table>
                  <thead>
                    <tr>
                      <th>Exercício</th>
                      <th>Grupo</th>
                      <th>Séries</th>
                      <th>Reps</th>
                      <th>Carga</th>
                      <th>Descanso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ficha.exercicios.map((ex) => (
                      <tr key={ex.id}>
                        <td>{ex.nome}</td>
                        <td className="neutro">{ex.grupo_muscular || '—'}</td>
                        <td>{ex.series}</td>
                        <td>{ex.repeticoes}</td>
                        <td>{ex.carga_kg ? `${numero(ex.carga_kg)} kg` : '—'}</td>
                        <td className="neutro">{ex.descanso_seg ? `${ex.descanso_seg}s` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {ficha.observacoes && <p className="vazio">{ficha.observacoes}</p>}
          </Cartao>
        ))}
      </div>

      {editando && (
        <FormularioFicha
          dados={editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null)
            carregar()
          }}
        />
      )}
    </>
  )
}

function FormularioFicha({ dados, aoFechar, aoSalvar }) {
  const [form, setForm] = useState(dados.form)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const alterar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  function alterarExercicio(indice, campo, valor) {
    const exercicios = form.exercicios.map((ex, i) => (i === indice ? { ...ex, [campo]: valor } : ex))
    setForm({ ...form, exercicios })
  }

  function mover(indice, direcao) {
    const destino = indice + direcao
    if (destino < 0 || destino >= form.exercicios.length) return
    const exercicios = [...form.exercicios]
    ;[exercicios[indice], exercicios[destino]] = [exercicios[destino], exercicios[indice]]
    setForm({ ...form, exercicios })
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    const exercicios = form.exercicios
      .filter((ex) => ex.nome.trim())
      .map((ex) => ({
        nome: ex.nome.trim(),
        grupo_muscular: ex.grupo_muscular.trim() || null,
        series: Number(ex.series) || 1,
        repeticoes: String(ex.repeticoes || '10'),
        carga_kg: valorOuNulo(ex.carga_kg),
        descanso_seg: valorOuNulo(ex.descanso_seg),
        observacoes: ex.observacoes.trim() || null,
      }))
    if (!exercicios.length) {
      setErro('Adicione pelo menos um exercício com nome.')
      return
    }

    setEnviando(true)
    try {
      const corpo = {
        nome: form.nome.trim(),
        foco: form.foco.trim() || null,
        observacoes: form.observacoes.trim() || null,
        ativa: form.ativa,
        exercicios,
      }
      if (dados.id) await api.put(`/fichas/${dados.id}`, corpo)
      else await api.post('/fichas', corpo)
      aoSalvar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo={dados.id ? 'Editar ficha' : 'Nova ficha'} aoFechar={aoFechar}>
      <form className="empilhado" onSubmit={enviar}>
        <Campo rotulo="Nome da ficha" value={form.nome} onChange={alterar('nome')} required placeholder="Treino A" />
        <Campo rotulo="Foco" value={form.foco} onChange={alterar('foco')} placeholder="Peito, ombro e tríceps" />

        <div className="empilhado">
          <span className="rotulo-fraco">Exercícios</span>
          {form.exercicios.map((ex, i) => (
            <div key={i} className="cartao" style={{ background: 'var(--fundo-cartao-2)', padding: 12 }}>
              <div className="linha espaco-entre" style={{ marginBottom: 8 }}>
                <strong className="unidade">#{i + 1}</strong>
                <div className="linha">
                  <button type="button" className="fantasma icone" title="Subir" onClick={() => mover(i, -1)}><IconeCima /></button>
                  <button type="button" className="fantasma icone" title="Descer" onClick={() => mover(i, 1)}><IconeBaixo /></button>
                  <button
                    type="button"
                    className="perigo icone"
                    title="Remover"
                    onClick={() => setForm({ ...form, exercicios: form.exercicios.filter((_, j) => j !== i) })}
                  >
                    <IconeLixo />
                  </button>
                </div>
              </div>
              <div className="grade grade-2">
                <Campo
                  rotulo="Exercício"
                  value={ex.nome}
                  onChange={(e) => alterarExercicio(i, 'nome', e.target.value)}
                  placeholder="Supino reto"
                />
                <Campo
                  rotulo="Grupo muscular"
                  value={ex.grupo_muscular}
                  onChange={(e) => alterarExercicio(i, 'grupo_muscular', e.target.value)}
                  placeholder="Peito"
                />
              </div>
              <div className="grade grade-4" style={{ marginTop: 10 }}>
                <Campo
                  rotulo="Séries"
                  type="number"
                  min="1"
                  max="20"
                  value={ex.series}
                  onChange={(e) => alterarExercicio(i, 'series', e.target.value)}
                />
                <Campo
                  rotulo="Repetições"
                  value={ex.repeticoes}
                  onChange={(e) => alterarExercicio(i, 'repeticoes', e.target.value)}
                  placeholder="8-10"
                />
                <Campo
                  rotulo="Carga (kg)"
                  type="number"
                  step="0.5"
                  min="0"
                  value={ex.carga_kg}
                  onChange={(e) => alterarExercicio(i, 'carga_kg', e.target.value)}
                />
                <Campo
                  rotulo="Descanso (s)"
                  type="number"
                  min="0"
                  max="900"
                  value={ex.descanso_seg}
                  onChange={(e) => alterarExercicio(i, 'descanso_seg', e.target.value)}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="secundario"
            onClick={() => setForm({ ...form, exercicios: [...form.exercicios, { ...EXERCICIO_VAZIO }] })}
          >
            Adicionar exercício
          </button>
        </div>

        <Campo rotulo="Observações da ficha">
          <textarea value={form.observacoes} onChange={alterar('observacoes')} placeholder="Aquecimento, cadência, técnicas…" />
        </Campo>

        <label className="linha" style={{ gap: 8, fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            style={{ width: 18, height: 18 }}
            checked={form.ativa}
            onChange={(e) => setForm({ ...form, ativa: e.target.checked })}
          />
          Ficha ativa (aparece primeiro ao registrar treino)
        </label>

        <Erro>{erro}</Erro>
        <div className="linha">
          <button type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar ficha'}</button>
          <button type="button" className="fantasma" onClick={aoFechar}>Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}
