import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Campo, Carregando, Cartao, Erro, Modal, Sucesso } from '../components/Interface'
import { IconeLixo, IconeMais } from '../components/Icones'
import { api } from '../lib/api'
import { COR_GRADE, COR_SERIE_2, estiloDica, eixo } from '../lib/grafico'
import { dataCurta, dataLonga, hojeISO, numero, valorOuNulo } from '../lib/formato'

const CAMPOS = [
  { chave: 'peso_kg', rotulo: 'Peso', unidade: 'kg', passo: '0.1' },
  { chave: 'gordura_pct', rotulo: 'Gordura', unidade: '%', passo: '0.1' },
  { chave: 'pescoco_cm', rotulo: 'Pescoço', unidade: 'cm', passo: '0.5' },
  { chave: 'ombro_cm', rotulo: 'Ombro', unidade: 'cm', passo: '0.5' },
  { chave: 'peito_cm', rotulo: 'Peitoral', unidade: 'cm', passo: '0.5' },
  { chave: 'cintura_cm', rotulo: 'Cintura', unidade: 'cm', passo: '0.5' },
  { chave: 'abdomen_cm', rotulo: 'Abdômen', unidade: 'cm', passo: '0.5' },
  { chave: 'quadril_cm', rotulo: 'Quadril', unidade: 'cm', passo: '0.5' },
  { chave: 'braco_d_cm', rotulo: 'Braço dir.', unidade: 'cm', passo: '0.5' },
  { chave: 'braco_e_cm', rotulo: 'Braço esq.', unidade: 'cm', passo: '0.5' },
  { chave: 'antebraco_d_cm', rotulo: 'Antebraço dir.', unidade: 'cm', passo: '0.5' },
  { chave: 'antebraco_e_cm', rotulo: 'Antebraço esq.', unidade: 'cm', passo: '0.5' },
  { chave: 'coxa_d_cm', rotulo: 'Coxa dir.', unidade: 'cm', passo: '0.5' },
  { chave: 'coxa_e_cm', rotulo: 'Coxa esq.', unidade: 'cm', passo: '0.5' },
  { chave: 'panturrilha_d_cm', rotulo: 'Panturrilha dir.', unidade: 'cm', passo: '0.5' },
  { chave: 'panturrilha_e_cm', rotulo: 'Panturrilha esq.', unidade: 'cm', passo: '0.5' },
]

const PRINCIPAIS = ['peso_kg', 'gordura_pct', 'cintura_cm', 'braco_d_cm']

export default function Medidas() {
  const [medidas, setMedidas] = useState(null)
  const [erro, setErro] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [metrica, setMetrica] = useState('peso_kg')

  const carregar = useCallback(() => {
    api.get('/medidas').then(setMedidas).catch((e) => setErro(e.message))
  }, [])

  useEffect(carregar, [carregar])

  const serie = useMemo(() => {
    if (!medidas) return []
    return medidas
      .filter((m) => m[metrica] !== null && m[metrica] !== undefined)
      .slice()
      .reverse()
      .map((m) => ({ dia: dataCurta(m.data), valor: m[metrica] }))
  }, [medidas, metrica])

  async function excluir(medida) {
    if (!confirm(`Excluir as medidas de ${dataLonga(medida.data)}?`)) return
    try {
      await api.del(`/medidas/${medida.id}`)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  if (!medidas) return <Carregando />

  const ultima = medidas[0]
  const anterior = medidas[1]
  const campoMetrica = CAMPOS.find((c) => c.chave === metrica)

  return (
    <>
      <header className="cabecalho-pagina">
        <div>
          <h1>Medidas corporais</h1>
          <p className="subtitulo">
            {ultima ? `Última: ${dataLonga(ultima.data)}` : 'Nenhuma medida registrada ainda'}
          </p>
        </div>
        <button type="button" className="linha" onClick={() => setFormAberto(true)}>
          <IconeMais /> Registrar
        </button>
      </header>

      <Erro>{erro}</Erro>

      {ultima && (
        <div className="grade grade-4">
          {PRINCIPAIS.map((chave) => {
            const campo = CAMPOS.find((c) => c.chave === chave)
            const atual = ultima[chave]
            const antes = anterior?.[chave]
            const delta = atual !== null && antes !== null && antes !== undefined ? +(atual - antes).toFixed(1) : null
            return (
              <Cartao key={chave}>
                <span className="rotulo-fraco">{campo.rotulo}</span>
                <div className="linha" style={{ marginTop: 6 }}>
                  <span className="numero-grande">{numero(atual)}</span>
                  <span className="unidade">{campo.unidade}</span>
                </div>
                {delta !== null && delta !== 0 && (
                  <span className="unidade">
                    {delta > 0 ? '+' : ''}{numero(delta)} {campo.unidade} desde a anterior
                  </span>
                )}
              </Cartao>
            )
          })}
        </div>
      )}

      <Cartao titulo={`Evolução — ${campoMetrica.rotulo}`}>
        <div className="chips" style={{ marginBottom: 12 }}>
          {CAMPOS.map((c) => (
            <button
              key={c.chave}
              type="button"
              className={`chip ${metrica === c.chave ? 'ativo' : ''}`}
              onClick={() => setMetrica(c.chave)}
            >
              {c.rotulo}
            </button>
          ))}
        </div>
        {serie.length < 2 ? (
          <p className="vazio">
            Registre pelo menos duas datas com {campoMetrica.rotulo.toLowerCase()} para ver o gráfico.
          </p>
        ) : (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={serie} margin={{ top: 8, right: 14, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={COR_GRADE} vertical={false} />
                <XAxis dataKey="dia" {...eixo} />
                <YAxis {...eixo} domain={['auto', 'auto']} />
                <Tooltip
                  {...estiloDica}
                  formatter={(valor) => [`${numero(valor)} ${campoMetrica.unidade}`, campoMetrica.rotulo]}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke={COR_SERIE_2}
                  strokeWidth={2}
                  dot={{ r: 4, fill: COR_SERIE_2, stroke: '#171a21', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Cartao>

      <Cartao titulo="Histórico">
        {medidas.length === 0 ? (
          <p className="vazio">Nada registrado ainda.</p>
        ) : (
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  {CAMPOS.map((c) => (
                    <th key={c.chave}>{c.rotulo}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {medidas.map((m) => (
                  <tr key={m.id}>
                    <td>{dataCurta(m.data)}</td>
                    {CAMPOS.map((c) => (
                      <td key={c.chave}>{m[c.chave] === null ? '—' : numero(m[c.chave])}</td>
                    ))}
                    <td>
                      <button type="button" className="perigo icone" title="Excluir" onClick={() => excluir(m)}>
                        <IconeLixo />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>

      {formAberto && (
        <FormularioMedida
          ultima={ultima}
          aoFechar={() => setFormAberto(false)}
          aoSalvar={() => {
            setFormAberto(false)
            carregar()
          }}
        />
      )}
    </>
  )
}

function FormularioMedida({ ultima, aoFechar, aoSalvar }) {
  const [data, setData] = useState(hojeISO())
  const [valores, setValores] = useState(() =>
    Object.fromEntries(CAMPOS.map((c) => [c.chave, ''])),
  )
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)

  function copiarUltima() {
    if (!ultima) return
    setValores(
      Object.fromEntries(CAMPOS.map((c) => [c.chave, ultima[c.chave] ?? ''])),
    )
    setAviso('Valores da última medição copiados — ajuste o que mudou.')
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    const corpo = { data, observacoes: observacoes.trim() || null }
    CAMPOS.forEach((c) => {
      corpo[c.chave] = valorOuNulo(valores[c.chave])
    })
    if (CAMPOS.every((c) => corpo[c.chave] === null)) {
      setErro('Preencha pelo menos um valor.')
      return
    }
    setEnviando(true)
    try {
      await api.post('/medidas', corpo)
      aoSalvar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Registrar medidas" aoFechar={aoFechar}>
      <form className="empilhado" onSubmit={enviar}>
        <div className="linha espaco-entre">
          <Campo rotulo="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          {ultima && (
            <button type="button" className="secundario pequeno" onClick={copiarUltima}>
              Copiar última
            </button>
          )}
        </div>
        <Sucesso>{aviso}</Sucesso>

        <div className="grade grade-3">
          {CAMPOS.map((c) => (
            <Campo key={c.chave} rotulo={`${c.rotulo} (${c.unidade})`}>
              <input
                type="number"
                step={c.passo}
                min="0"
                value={valores[c.chave]}
                onChange={(e) => setValores({ ...valores, [c.chave]: e.target.value })}
              />
            </Campo>
          ))}
        </div>

        <Campo rotulo="Observações">
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </Campo>

        <p className="vazio">Se já existir uma medição nesta data, ela será atualizada.</p>
        <Erro>{erro}</Erro>
        <div className="linha">
          <button type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar medidas'}</button>
          <button type="button" className="fantasma" onClick={aoFechar}>Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}
