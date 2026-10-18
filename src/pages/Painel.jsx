import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Barra, Carregando, Cartao, Erro } from '../components/Interface'
import { IconeGota } from '../components/Icones'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { COR_GRADE, COR_SERIE, estiloDica, eixo } from '../lib/grafico'
import { dataCurta, dataLonga, hojeISO, litros, numero } from '../lib/formato'

const COPOS = [250, 500, 750]

export default function Painel() {
  const { usuario } = useAuth()
  const [resumo, setResumo] = useState(null)
  const [erro, setErro] = useState('')
  const [salvandoAgua, setSalvandoAgua] = useState(false)

  const carregar = useCallback(() => {
    api.get('/resumo').then(setResumo).catch((e) => setErro(e.message))
  }, [])

  useEffect(carregar, [carregar])

  async function registrarAgua(ml) {
    setSalvandoAgua(true)
    setErro('')
    try {
      await api.post('/agua', { data: hojeISO(), ml })
      carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvandoAgua(false)
    }
  }

  if (erro && !resumo) return <Erro>{erro}</Erro>
  if (!resumo) return <Carregando />

  const { agua, calorias, treino, corpo, ultimos_7_dias: dias } = resumo
  const dadosGrafico = dias.map((d) => ({
    dia: dataCurta(d.data),
    kcal: d.kcal,
    treinou: d.treinou,
  }))

  return (
    <>
      <header className="cabecalho-pagina">
        <div>
          <h1>Olá, {usuario.nome.split(' ')[0]}</h1>
          <p className="subtitulo">{dataLonga(resumo.hoje)}</p>
        </div>
      </header>

      <Erro>{erro}</Erro>

      <div className="grade grade-2">
        <Cartao titulo="Treino de hoje">
          {treino.hoje.length === 0 ? (
            <>
              <p className="vazio">Nenhum treino registrado hoje.</p>
              <Link to="/treinos"><button type="button" className="pequeno">Registrar treino</button></Link>
            </>
          ) : (
            <div className="empilhado">
              {treino.hoje.map((t) => (
                <div key={t.id} className="linha espaco-entre">
                  <strong>{t.titulo}</strong>
                  <span className="unidade">{t.duracao_min ? `${t.duracao_min} min` : ''}</span>
                </div>
              ))}
              <Link to="/treinos"><button type="button" className="secundario pequeno">Ver calendário</button></Link>
            </div>
          )}
          <div className="linha espaco-entre" style={{ marginTop: 14 }}>
            <span className="rotulo-fraco">Sequência</span>
            <strong>{treino.sequencia_atual} {treino.sequencia_atual === 1 ? 'dia' : 'dias'}</strong>
          </div>
          <div className="linha espaco-entre">
            <span className="rotulo-fraco">Nesta semana</span>
            <strong>{treino.treinos_na_semana} treinos</strong>
          </div>
        </Cartao>

        <Cartao titulo="Água de hoje">
          <div className="linha" style={{ gap: 8 }}>
            <span className="positivo" style={{ display: 'flex' }}><IconeGota /></span>
            <span className="numero-grande">{litros(agua.total_ml)}</span>
            <span className="unidade">de {litros(agua.meta_ml)}</span>
          </div>
          <Barra valor={agua.total_ml} meta={agua.meta_ml} cor="azul" />
          <div className="chips" style={{ marginTop: 14 }}>
            {COPOS.map((ml) => (
              <button
                key={ml}
                type="button"
                className="chip"
                disabled={salvandoAgua}
                onClick={() => registrarAgua(ml)}
              >
                +{ml} ml
              </button>
            ))}
            <button
              type="button"
              className="chip"
              disabled={salvandoAgua || agua.total_ml <= 0}
              onClick={() => registrarAgua(-250)}
            >
              −250 ml
            </button>
          </div>
        </Cartao>

        <Cartao titulo="Calorias de hoje">
          <div className="linha">
            <span className="numero-grande">{numero(calorias.total, 0)}</span>
            <span className="unidade">de {numero(calorias.meta, 0)} kcal</span>
          </div>
          <Barra valor={calorias.total} meta={calorias.meta} />
          <div className="linha espaco-entre" style={{ marginTop: 14 }}>
            <span className="rotulo-fraco">Proteína</span>
            <strong>{numero(calorias.proteina_g)} / {calorias.meta_proteina_g} g</strong>
          </div>
          <Barra valor={calorias.proteina_g} meta={calorias.meta_proteina_g} cor="amarelo" />
          <Link to="/dieta"><button type="button" className="secundario pequeno" style={{ marginTop: 14 }}>Adicionar refeição</button></Link>
        </Cartao>

        <Cartao titulo="Corpo">
          <div className="linha">
            <span className="numero-grande">{numero(corpo.peso_kg)}</span>
            <span className="unidade">kg</span>
            {corpo.variacao !== null && (
              <span className={corpo.variacao > 0 ? 'negativo' : corpo.variacao < 0 ? 'positivo' : 'neutro'}>
                {corpo.variacao > 0 ? '+' : ''}{numero(corpo.variacao)} kg
              </span>
            )}
          </div>
          <div className="linha espaco-entre" style={{ marginTop: 14 }}>
            <span className="rotulo-fraco">IMC</span>
            <strong>{corpo.imc ?? '—'}</strong>
          </div>
          {!corpo.imc && <p className="vazio">Informe sua altura no perfil para ver o IMC.</p>}
          <Link to="/medidas"><button type="button" className="secundario pequeno" style={{ marginTop: 10 }}>Registrar medidas</button></Link>
        </Cartao>
      </div>

      <Cartao titulo="Calorias nos últimos 7 dias" className="cartao">
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={dadosGrafico} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={COR_GRADE} vertical={false} />
              <XAxis dataKey="dia" {...eixo} />
              <YAxis {...eixo} />
              <Tooltip
                {...estiloDica}
                formatter={(valor) => [`${numero(valor, 0)} kcal`, 'Consumido']}
              />
              <ReferenceLine
                y={calorias.meta}
                stroke="#58a6ff"
                strokeDasharray="4 4"
                label={{ value: 'meta', fill: '#9aa3b2', fontSize: 11, position: 'right' }}
              />
              <Bar dataKey="kcal" fill={COR_SERIE} radius={[4, 4, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="legenda">
          {dias.map((d) => (
            <span key={d.data}>
              <i style={{ background: d.treinou ? COR_SERIE : 'transparent' }} />
              {dataCurta(d.data)}
            </span>
          ))}
        </div>
        <p className="vazio">Marcado em verde: dias em que você treinou.</p>
      </Cartao>
    </>
  )
}
