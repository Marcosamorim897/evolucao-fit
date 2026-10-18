import { useCallback, useEffect, useMemo, useState } from 'react'
import { Campo, Carregando, Cartao, Erro, Modal } from '../components/Interface'
import { IconeDireita, IconeEsquerda, IconeLixo, IconeMais } from '../components/Icones'
import { api } from '../lib/api'
import { DIAS_SEMANA, MESES, dataLonga, hojeISO, numero, paraISO, valorOuNulo } from '../lib/formato'

export default function Treinos() {
  const hoje = useMemo(() => new Date(), [])
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [calendario, setCalendario] = useState(null)
  const [fichas, setFichas] = useState([])
  const [erro, setErro] = useState('')
  const [diaAberto, setDiaAberto] = useState(null)

  const carregar = useCallback(() => {
    api.get(`/treinos/calendario/${ano}/${mes}`).then(setCalendario).catch((e) => setErro(e.message))
  }, [ano, mes])

  useEffect(carregar, [carregar])
  useEffect(() => {
    api.get('/fichas').then(setFichas).catch(() => {})
  }, [])

  function mudarMes(delta) {
    const data = new Date(ano, mes - 1 + delta, 1)
    setAno(data.getFullYear())
    setMes(data.getMonth() + 1)
  }

  const celulas = useMemo(() => {
    const primeiro = new Date(ano, mes - 1, 1)
    const totalDias = new Date(ano, mes, 0).getDate()
    const vazios = Array.from({ length: primeiro.getDay() }, () => null)
    const dias = Array.from({ length: totalDias }, (_, i) => new Date(ano, mes - 1, i + 1))
    return [...vazios, ...dias]
  }, [ano, mes])

  if (!calendario) return <Carregando />

  const iso = hojeISO()
  const treinosDoMes = Object.entries(calendario.dias).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <>
      <header className="cabecalho-pagina">
        <div>
          <h1>Treinos</h1>
          <p className="subtitulo">
            {calendario.total_no_mes} {calendario.total_no_mes === 1 ? 'treino' : 'treinos'} em {MESES[mes - 1]}
            {' · '}sequência de {calendario.sequencia_atual} {calendario.sequencia_atual === 1 ? 'dia' : 'dias'}
          </p>
        </div>
        <button type="button" className="linha" onClick={() => setDiaAberto(iso)}>
          <IconeMais /> Registrar
        </button>
      </header>

      <Erro>{erro}</Erro>

      <Cartao
        titulo={`${MESES[mes - 1][0].toUpperCase()}${MESES[mes - 1].slice(1)} de ${ano}`}
        acao={
          <div className="linha">
            <button type="button" className="secundario icone" title="Mês anterior" onClick={() => mudarMes(-1)}>
              <IconeEsquerda />
            </button>
            <button type="button" className="secundario icone" title="Mês seguinte" onClick={() => mudarMes(1)}>
              <IconeDireita />
            </button>
          </div>
        }
      >
        <div className="calendario">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="nome-dia">{d}</div>
          ))}
          {celulas.map((data, i) => {
            if (!data) return <div key={`vazio-${i}`} className="dia fora" />
            const chave = paraISO(data)
            const treinos = calendario.dias[chave]
            const classes = ['dia']
            if (treinos) classes.push('treinou')
            if (chave === iso) classes.push('hoje')
            if (chave > iso) classes.push('futuro')
            return (
              <button
                key={chave}
                type="button"
                className={classes.join(' ')}
                onClick={() => setDiaAberto(chave)}
                title={treinos ? treinos.map((t) => t.titulo).join(', ') : 'Sem treino'}
              >
                {data.getDate()}
                {treinos && <span className="marcador" />}
              </button>
            )
          })}
        </div>
        <div className="legenda">
          <span><i style={{ background: 'rgba(34,211,167,0.3)', borderColor: 'var(--acento-escuro)' }} /> treinei</span>
          <span><i style={{ background: 'var(--fundo-cartao-2)' }} /> não treinei</span>
          <span><i style={{ background: 'transparent', boxShadow: '0 0 0 2px var(--azul) inset' }} /> hoje</span>
        </div>
        <p className="vazio">Toque em um dia para registrar ou ver o treino.</p>
      </Cartao>

      <Cartao titulo="Treinos do mês">
        {treinosDoMes.length === 0 ? (
          <p className="vazio">Nenhum treino registrado neste mês.</p>
        ) : (
          treinosDoMes.map(([dia, lista]) => (
            <div key={dia} className="item-lista">
              <div>
                <strong>{lista.map((t) => t.titulo).join(' + ')}</strong>
                <div className="detalhe">{dataLonga(dia)}</div>
              </div>
              <button type="button" className="secundario pequeno" onClick={() => setDiaAberto(dia)}>Abrir</button>
            </div>
          ))
        )}
      </Cartao>

      {diaAberto && (
        <DiaDeTreino
          dia={diaAberto}
          fichas={fichas}
          aoFechar={() => setDiaAberto(null)}
          aoMudar={carregar}
        />
      )}
    </>
  )
}

function DiaDeTreino({ dia, fichas, aoFechar, aoMudar }) {
  const [treinos, setTreinos] = useState(null)
  const [erro, setErro] = useState('')
  const [criando, setCriando] = useState(false)

  const carregar = useCallback(() => {
    api
      .get(`/treinos?inicio=${dia}&fim=${dia}`)
      .then((lista) => {
        setTreinos(lista)
        setCriando(lista.length === 0)
      })
      .catch((e) => setErro(e.message))
  }, [dia])

  useEffect(carregar, [carregar])

  async function excluir(treino) {
    if (!confirm('Excluir este treino do histórico?')) return
    try {
      await api.del(`/treinos/${treino.id}`)
      carregar()
      aoMudar()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <Modal titulo={dataLonga(dia)} aoFechar={aoFechar}>
      <Erro>{erro}</Erro>

      {treinos === null ? (
        <Carregando />
      ) : (
        <div className="empilhado">
          {treinos.map((treino) => (
            <div key={treino.id} className="cartao" style={{ background: 'var(--fundo-cartao-2)' }}>
              <div className="linha espaco-entre">
                <strong>{treino.titulo || treino.ficha_nome || 'Treino'}</strong>
                <button type="button" className="perigo icone" title="Excluir" onClick={() => excluir(treino)}>
                  <IconeLixo />
                </button>
              </div>
              {treino.duracao_min && <div className="detalhe">{treino.duracao_min} minutos</div>}
              {treino.series.length > 0 && (
                <div className="tabela-rolagem" style={{ marginTop: 8 }}>
                  <table>
                    <thead>
                      <tr><th>Exercício</th><th>Séries</th><th>Reps</th><th>Carga</th></tr>
                    </thead>
                    <tbody>
                      {treino.series.map((s) => (
                        <tr key={s.id}>
                          <td>{s.nome_exercicio}</td>
                          <td>{s.series ?? '—'}</td>
                          <td>{s.repeticoes || '—'}</td>
                          <td>{s.carga_kg ? `${numero(s.carga_kg)} kg` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {treino.notas && <p className="vazio">{treino.notas}</p>}
            </div>
          ))}

          {criando ? (
            <FormularioTreino
              dia={dia}
              fichas={fichas}
              aoCancelar={() => (treinos.length ? setCriando(false) : aoFechar())}
              aoSalvar={() => {
                carregar()
                aoMudar()
              }}
            />
          ) : (
            <button type="button" className="secundario" onClick={() => setCriando(true)}>
              Registrar outro treino neste dia
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}

function FormularioTreino({ dia, fichas, aoCancelar, aoSalvar }) {
  const ativas = fichas.filter((f) => f.ativa)
  const [fichaId, setFichaId] = useState(ativas[0]?.id ?? '')
  const [titulo, setTitulo] = useState('')
  const [duracao, setDuracao] = useState('')
  const [notas, setNotas] = useState('')
  const [series, setSeries] = useState([])
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Ao escolher a ficha, traz os exercicios dela ja com a ultima carga usada.
  useEffect(() => {
    const ficha = fichas.find((f) => String(f.id) === String(fichaId))
    if (!ficha) {
      setSeries([])
      return
    }
    let ativo = true
    Promise.all(
      ficha.exercicios.map(async (ex) => {
        let ultima = { carga_kg: null, repeticoes: null }
        try {
          ultima = await api.get(`/treinos/ultima-carga/${ex.id}`)
        } catch {
          /* sem histórico ainda */
        }
        return {
          exercicio_id: ex.id,
          nome_exercicio: ex.nome,
          series: ex.series,
          repeticoes: ultima.repeticoes || ex.repeticoes,
          carga_kg: ultima.carga_kg ?? ex.carga_kg ?? '',
        }
      }),
    ).then((lista) => ativo && setSeries(lista))
    return () => {
      ativo = false
    }
  }, [fichaId, fichas])

  function alterarSerie(indice, campo, valor) {
    setSeries(series.map((s, i) => (i === indice ? { ...s, [campo]: valor } : s)))
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await api.post('/treinos', {
        data: dia,
        ficha_id: fichaId ? Number(fichaId) : null,
        titulo: titulo.trim() || null,
        duracao_min: valorOuNulo(duracao),
        notas: notas.trim() || null,
        series: series.map((s) => ({
          exercicio_id: s.exercicio_id,
          nome_exercicio: s.nome_exercicio,
          series: valorOuNulo(s.series),
          repeticoes: String(s.repeticoes || ''),
          carga_kg: valorOuNulo(s.carga_kg),
        })),
      })
      aoSalvar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="cartao empilhado" style={{ background: 'var(--fundo-cartao-2)' }} onSubmit={enviar}>
      <Campo rotulo="Ficha usada">
        <select value={fichaId} onChange={(e) => setFichaId(e.target.value)}>
          <option value="">Treino livre (sem ficha)</option>
          {fichas.map((f) => (
            <option key={f.id} value={f.id}>{f.nome}{f.foco ? ` — ${f.foco}` : ''}</option>
          ))}
        </select>
      </Campo>

      <div className="grade grade-2">
        <Campo
          rotulo="Título (opcional)"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex.: corrida 5 km"
        />
        <Campo
          rotulo="Duração (min)"
          type="number"
          min="1"
          max="600"
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
        />
      </div>

      {series.length > 0 && (
        <div className="empilhado">
          <span className="rotulo-fraco">Cargas de hoje (vêm preenchidas com a última vez)</span>
          {series.map((s, i) => (
            <div key={s.exercicio_id} className="grade grade-3" style={{ alignItems: 'end' }}>
              <Campo rotulo={s.nome_exercicio}>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={s.carga_kg}
                  onChange={(e) => alterarSerie(i, 'carga_kg', e.target.value)}
                  placeholder="carga kg"
                />
              </Campo>
              <Campo
                rotulo="Repetições"
                value={s.repeticoes}
                onChange={(e) => alterarSerie(i, 'repeticoes', e.target.value)}
              />
              <Campo
                rotulo="Séries"
                type="number"
                min="1"
                max="20"
                value={s.series ?? ''}
                onChange={(e) => alterarSerie(i, 'series', e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <Campo rotulo="Notas">
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Como foi o treino?" />
      </Campo>

      <Erro>{erro}</Erro>
      <div className="linha">
        <button type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar treino'}</button>
        <button type="button" className="fantasma" onClick={aoCancelar}>Cancelar</button>
      </div>
    </form>
  )
}
