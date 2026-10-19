import { useEffect, useState } from 'react'
import { Carregando, Cartao, Erro, Sucesso } from '../components/Interface'
import { api } from '../lib/api'
import { dataLonga, hojeISO, numero } from '../lib/formato'

/** Dieta da nutricionista por horário, com botão para lançar a refeição no diário. */
export default function PlanoAlimentar({ dia, alimentos, aoLancar }) {
  const [plano, setPlano] = useState(undefined)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.get('/plano').then(setPlano).catch((e) => setErro(e.message))
  }, [])

  if (erro && plano === undefined) return <Erro>{erro}</Erro>
  if (plano === undefined) return <Carregando />
  if (plano === null) {
    return (
      <Cartao titulo="Plano alimentar">
        <p className="vazio">Nenhum plano cadastrado ainda.</p>
      </Cartao>
    )
  }

  const grupos = Object.fromEntries(plano.grupos.map((g) => [g.nome, g]))
  const macros = Object.fromEntries(alimentos.map((a) => [a.nome.toLowerCase(), a]))
  const listas = plano.grupos.filter((g) => g.escolhas.every((e) => e.gramas == null))

  return (
    <>
      {plano.refeicoes.map((refeicao, indice) => (
        <RefeicaoDoPlano
          key={indice}
          indice={indice}
          refeicao={refeicao}
          grupos={grupos}
          macros={macros}
          dia={dia}
          aoLancar={aoLancar}
        />
      ))}

      {listas.map((grupo) => (
        <Cartao key={grupo.nome} titulo={grupo.nome}>
          {grupo.descricao && <p className="unidade">{grupo.descricao}</p>}
          <p style={{ marginTop: 6 }}>{grupo.escolhas.map((e) => e.alimento).join(', ')}.</p>
        </Cartao>
      ))}
    </>
  )
}

function RefeicaoDoPlano({ indice, refeicao, grupos, macros, dia, aoLancar }) {
  const [opcao, setOpcao] = useState(0)
  const [escolhas, setEscolhas] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  const itens = refeicao.opcoes[opcao].itens
  const candidatosDe = (item) => (item.escolhas.length ? item.escolhas : grupos[item.grupo]?.escolhas ?? [])

  const selecionados = itens
    .map((item, i) => candidatosDe(item)[escolhas[i] ?? 0])
    .filter((e) => e && e.gramas != null)
  const total = selecionados.reduce(
    (soma, e) => {
      const a = macros[e.alimento.toLowerCase()]
      if (!a) return soma
      const f = e.gramas / 100
      return { kcal: soma.kcal + a.kcal_100 * f, prot: soma.prot + a.proteina_100 * f }
    },
    { kcal: 0, prot: 0 },
  )

  function trocarOpcao(nova) {
    setOpcao(nova)
    setEscolhas({})
    setAviso('')
  }

  async function lancar() {
    setErro('')
    setAviso('')
    setEnviando(true)
    try {
      await api.post('/plano/lancar', { data: dia, refeicao: indice, opcao, escolhas })
      setAviso(`Lançado no diário de ${dia === hojeISO() ? 'hoje' : dataLonga(dia)}.`)
      aoLancar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Cartao
      titulo={`${refeicao.horario} · ${refeicao.nome}`}
      acao={<span className="unidade">≈ {numero(total.kcal, 0)} kcal · P {numero(total.prot, 0)} g</span>}
    >
      {refeicao.obs && <p className="unidade" style={{ marginBottom: 10 }}>{refeicao.obs}</p>}

      {refeicao.opcoes.length > 1 && (
        <div className="chips" style={{ marginBottom: 10 }}>
          {refeicao.opcoes.map((o, i) => (
            <button key={o.nome} type="button" className={`chip ${opcao === i ? 'ativo' : ''}`} onClick={() => trocarOpcao(i)}>
              {o.nome}
            </button>
          ))}
        </div>
      )}

      {itens.map((item, i) => {
        const candidatos = candidatosDe(item)
        const atual = candidatos[escolhas[i] ?? 0]
        return (
          <div key={`${opcao}-${i}`} className="item-lista">
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="rotulo-fraco">{item.rotulo}</span>
              {candidatos.length > 1 && candidatos.some((e) => e.gramas != null) ? (
                <select
                  value={escolhas[i] ?? 0}
                  onChange={(e) => setEscolhas({ ...escolhas, [i]: Number(e.target.value) })}
                  style={{ marginTop: 4 }}
                >
                  {candidatos.map((e, j) => (
                    <option key={j} value={j}>
                      {e.alimento}{e.texto ? ` — ${e.texto}` : ''}
                    </option>
                  ))}
                </select>
              ) : atual ? (
                <div><strong>{atual.alimento}</strong>{atual.texto ? <span className="unidade"> · {atual.texto}</span> : null}</div>
              ) : null}
              {item.texto && <div className="detalhe">{item.texto}</div>}
            </div>
          </div>
        )
      })}

      <Erro>{erro}</Erro>
      <Sucesso>{aviso}</Sucesso>
      <div className="linha" style={{ marginTop: 12 }}>
        <button type="button" onClick={lancar} disabled={enviando}>
          {enviando ? 'Lançando…' : 'Lançar no diário'}
        </button>
      </div>
    </Cartao>
  )
}
