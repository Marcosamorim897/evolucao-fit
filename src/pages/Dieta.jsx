import { useCallback, useEffect, useState } from 'react'
import { Barra, Campo, Carregando, Cartao, Erro, Modal } from '../components/Interface'
import { IconeGota, IconeLixo, IconeMais } from '../components/Icones'
import { api } from '../lib/api'
import { REFEICOES, hojeISO, litros, numero, valorOuNulo } from '../lib/formato'

const COPOS = [250, 500, 750]

export default function Dieta() {
  const [dia, setDia] = useState(hojeISO())
  const [diario, setDiario] = useState(null)
  const [agua, setAgua] = useState(null)
  const [alimentos, setAlimentos] = useState([])
  const [erro, setErro] = useState('')
  const [refeicaoAberta, setRefeicaoAberta] = useState(null)
  const [bibliotecaAberta, setBibliotecaAberta] = useState(false)

  const carregar = useCallback(() => {
    Promise.all([api.get(`/refeicoes/${dia}`), api.get(`/agua/${dia}`)])
      .then(([d, a]) => {
        setDiario(d)
        setAgua(a)
      })
      .catch((e) => setErro(e.message))
  }, [dia])

  const carregarAlimentos = useCallback(() => {
    api.get('/alimentos').then(setAlimentos).catch((e) => setErro(e.message))
  }, [])

  useEffect(carregar, [carregar])
  useEffect(carregarAlimentos, [carregarAlimentos])

  async function registrarAgua(ml) {
    try {
      setAgua(await api.post('/agua', { data: dia, ml }))
    } catch (e) {
      setErro(e.message)
    }
  }

  async function excluirItem(item) {
    try {
      await api.del(`/refeicoes/${item.id}`)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  if (!diario || !agua) return <Carregando />

  const { totais, meta_calorias: metaKcal, meta_proteina_g: metaProt } = diario
  const restante = Math.round(metaKcal - totais.kcal)

  return (
    <>
      <header className="cabecalho-pagina">
        <div>
          <h1>Alimentação e água</h1>
          <p className="subtitulo">Diário do dia selecionado</p>
        </div>
        <input
          type="date"
          value={dia}
          max={hojeISO()}
          onChange={(e) => setDia(e.target.value)}
          style={{ width: 'auto' }}
        />
      </header>

      <Erro>{erro}</Erro>

      <div className="grade grade-2">
        <Cartao titulo="Calorias">
          <div className="linha">
            <span className="numero-grande">{numero(totais.kcal, 0)}</span>
            <span className="unidade">de {numero(metaKcal, 0)} kcal</span>
          </div>
          <Barra valor={totais.kcal} meta={metaKcal} />
          <p className="unidade" style={{ marginTop: 8 }}>
            {restante >= 0 ? `Faltam ${numero(restante, 0)} kcal` : `${numero(-restante, 0)} kcal acima da meta`}
          </p>
          <div className="grade grade-3" style={{ marginTop: 12 }}>
            <div>
              <span className="rotulo-fraco">Proteína</span>
              <div><strong>{numero(totais.proteina_g)} g</strong> <span className="unidade">/ {metaProt}</span></div>
              <Barra valor={totais.proteina_g} meta={metaProt} cor="amarelo" />
            </div>
            <div>
              <span className="rotulo-fraco">Carbo</span>
              <div><strong>{numero(totais.carbo_g)} g</strong></div>
            </div>
            <div>
              <span className="rotulo-fraco">Gordura</span>
              <div><strong>{numero(totais.gordura_g)} g</strong></div>
            </div>
          </div>
        </Cartao>

        <Cartao titulo="Água">
          <div className="linha" style={{ gap: 8 }}>
            <span className="positivo" style={{ display: 'flex' }}><IconeGota /></span>
            <span className="numero-grande">{litros(agua.total_ml)}</span>
            <span className="unidade">de {litros(agua.meta_agua_ml)}</span>
          </div>
          <Barra valor={agua.total_ml} meta={agua.meta_agua_ml} cor="azul" />
          <div className="chips" style={{ marginTop: 14 }}>
            {COPOS.map((ml) => (
              <button key={ml} type="button" className="chip" onClick={() => registrarAgua(ml)}>+{ml} ml</button>
            ))}
            <button
              type="button"
              className="chip"
              disabled={agua.total_ml <= 0}
              onClick={() => registrarAgua(-250)}
            >
              −250 ml
            </button>
          </div>
          {agua.registros.length > 0 && (
            <p className="vazio">{agua.registros.length} registro(s) neste dia.</p>
          )}
        </Cartao>
      </div>

      {REFEICOES.map(({ chave, rotulo }) => {
        const itens = diario.itens.filter((i) => i.refeicao === chave)
        const kcal = itens.reduce((soma, i) => soma + i.kcal, 0)
        return (
          <Cartao
            key={chave}
            titulo={rotulo}
            acao={
              <div className="linha">
                <span className="unidade">{numero(kcal, 0)} kcal</span>
                <button type="button" className="secundario icone" title={`Adicionar em ${rotulo}`} onClick={() => setRefeicaoAberta(chave)}>
                  <IconeMais />
                </button>
              </div>
            }
          >
            {itens.length === 0 ? (
              <p className="vazio">Nada registrado.</p>
            ) : (
              itens.map((item) => (
                <div key={item.id} className="item-lista">
                  <div>
                    <strong>{item.descricao}</strong>
                    <div className="detalhe">
                      {numero(item.quantidade, 0)} g · {numero(item.kcal, 0)} kcal · P {numero(item.proteina_g)} /
                      C {numero(item.carbo_g)} / G {numero(item.gordura_g)}
                    </div>
                  </div>
                  <button type="button" className="perigo icone" title="Remover" onClick={() => excluirItem(item)}>
                    <IconeLixo />
                  </button>
                </div>
              ))
            )}
          </Cartao>
        )
      })}

      <Cartao
        titulo="Meus alimentos"
        acao={
          <button type="button" className="secundario pequeno" onClick={() => setBibliotecaAberta(true)}>
            Gerenciar ({alimentos.length})
          </button>
        }
      >
        <p className="vazio">
          Cadastre um alimento uma vez com os valores por 100 g; depois basta informar a quantidade.
        </p>
      </Cartao>

      {refeicaoAberta && (
        <FormularioItem
          dia={dia}
          refeicao={refeicaoAberta}
          alimentos={alimentos}
          aoFechar={() => setRefeicaoAberta(null)}
          aoSalvar={() => {
            setRefeicaoAberta(null)
            carregar()
          }}
        />
      )}

      {bibliotecaAberta && (
        <Biblioteca
          alimentos={alimentos}
          aoFechar={() => setBibliotecaAberta(false)}
          aoMudar={carregarAlimentos}
        />
      )}
    </>
  )
}

function FormularioItem({ dia, refeicao, alimentos, aoFechar, aoSalvar }) {
  const [modo, setModo] = useState('lista')
  const [alimentoId, setAlimentoId] = useState(alimentos[0]?.id ?? '')
  const [quantidade, setQuantidade] = useState(alimentos[0]?.porcao_padrao_g ?? 100)
  const [manual, setManual] = useState({ descricao: '', kcal: '', proteina_g: '', carbo_g: '', gordura_g: '' })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const alimento = alimentos.find((a) => String(a.id) === String(alimentoId))
  const fator = Number(quantidade || 0) / 100

  function escolherAlimento(id) {
    setAlimentoId(id)
    const escolhido = alimentos.find((a) => String(a.id) === String(id))
    if (escolhido) setQuantidade(escolhido.porcao_padrao_g)
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const corpo =
        modo === 'lista'
          ? { data: dia, refeicao, alimento_id: Number(alimentoId), quantidade: Number(quantidade) }
          : {
              data: dia,
              refeicao,
              descricao: manual.descricao.trim(),
              quantidade: 1,
              kcal: valorOuNulo(manual.kcal) ?? 0,
              proteina_g: valorOuNulo(manual.proteina_g) ?? 0,
              carbo_g: valorOuNulo(manual.carbo_g) ?? 0,
              gordura_g: valorOuNulo(manual.gordura_g) ?? 0,
            }
      await api.post('/refeicoes', corpo)
      aoSalvar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const rotulo = REFEICOES.find((r) => r.chave === refeicao)?.rotulo ?? refeicao

  return (
    <Modal titulo={`Adicionar em ${rotulo}`} aoFechar={aoFechar}>
      <form className="empilhado" onSubmit={enviar}>
        <div className="chips">
          <button type="button" className={`chip ${modo === 'lista' ? 'ativo' : ''}`} onClick={() => setModo('lista')}>
            Meus alimentos
          </button>
          <button type="button" className={`chip ${modo === 'manual' ? 'ativo' : ''}`} onClick={() => setModo('manual')}>
            Avulso
          </button>
        </div>

        {modo === 'lista' ? (
          alimentos.length === 0 ? (
            <p className="vazio">Nenhum alimento cadastrado. Use “Avulso” ou cadastre em “Meus alimentos”.</p>
          ) : (
            <>
              <Campo rotulo="Alimento">
                <select value={alimentoId} onChange={(e) => escolherAlimento(e.target.value)}>
                  {alimentos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}{a.marca ? ` (${a.marca})` : ''}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo
                rotulo={`Quantidade (${alimento?.unidade ?? 'g'})`}
                type="number"
                min="1"
                step="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
              />
              {alimento && (
                <p className="vazio">
                  Vai somar <strong>{numero(alimento.kcal_100 * fator, 0)} kcal</strong> ·{' '}
                  P {numero(alimento.proteina_100 * fator)} g · C {numero(alimento.carbo_100 * fator)} g ·{' '}
                  G {numero(alimento.gordura_100 * fator)} g
                </p>
              )}
            </>
          )
        ) : (
          <>
            <Campo
              rotulo="O que você comeu"
              value={manual.descricao}
              onChange={(e) => setManual({ ...manual, descricao: e.target.value })}
              required
              placeholder="Marmita do restaurante"
            />
            <div className="grade grade-4">
              <Campo rotulo="Kcal" type="number" min="0" value={manual.kcal} onChange={(e) => setManual({ ...manual, kcal: e.target.value })} />
              <Campo rotulo="Proteína (g)" type="number" min="0" value={manual.proteina_g} onChange={(e) => setManual({ ...manual, proteina_g: e.target.value })} />
              <Campo rotulo="Carbo (g)" type="number" min="0" value={manual.carbo_g} onChange={(e) => setManual({ ...manual, carbo_g: e.target.value })} />
              <Campo rotulo="Gordura (g)" type="number" min="0" value={manual.gordura_g} onChange={(e) => setManual({ ...manual, gordura_g: e.target.value })} />
            </div>
          </>
        )}

        <Erro>{erro}</Erro>
        <div className="linha">
          <button type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Adicionar'}</button>
          <button type="button" className="fantasma" onClick={aoFechar}>Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}

const ALIMENTO_VAZIO = {
  nome: '',
  marca: '',
  kcal_100: '',
  proteina_100: '',
  carbo_100: '',
  gordura_100: '',
  porcao_padrao_g: 100,
  unidade: 'g',
}

function Biblioteca({ alimentos, aoFechar, aoMudar }) {
  const [form, setForm] = useState(ALIMENTO_VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const alterar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  function editar(alimento) {
    setEditandoId(alimento.id)
    setForm({
      nome: alimento.nome,
      marca: alimento.marca ?? '',
      kcal_100: alimento.kcal_100,
      proteina_100: alimento.proteina_100,
      carbo_100: alimento.carbo_100,
      gordura_100: alimento.gordura_100,
      porcao_padrao_g: alimento.porcao_padrao_g,
      unidade: alimento.unidade,
    })
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const corpo = {
        nome: form.nome.trim(),
        marca: form.marca.trim() || null,
        kcal_100: valorOuNulo(form.kcal_100) ?? 0,
        proteina_100: valorOuNulo(form.proteina_100) ?? 0,
        carbo_100: valorOuNulo(form.carbo_100) ?? 0,
        gordura_100: valorOuNulo(form.gordura_100) ?? 0,
        porcao_padrao_g: valorOuNulo(form.porcao_padrao_g) ?? 100,
        unidade: form.unidade,
      }
      if (editandoId) await api.put(`/alimentos/${editandoId}`, corpo)
      else await api.post('/alimentos', corpo)
      setForm(ALIMENTO_VAZIO)
      setEditandoId(null)
      aoMudar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(alimento) {
    if (!confirm(`Excluir "${alimento.nome}" da lista? Os itens já lançados no diário continuam.`)) return
    try {
      await api.del(`/alimentos/${alimento.id}`)
      aoMudar()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <Modal titulo="Meus alimentos" aoFechar={aoFechar}>
      <form className="cartao empilhado" style={{ background: 'var(--fundo-cartao-2)' }} onSubmit={enviar}>
        <span className="rotulo-fraco">{editandoId ? 'Editando alimento' : 'Novo alimento (valores por 100 g/ml)'}</span>
        <div className="grade grade-2">
          <Campo rotulo="Nome" value={form.nome} onChange={alterar('nome')} required placeholder="Pão francês" />
          <Campo rotulo="Marca (opcional)" value={form.marca} onChange={alterar('marca')} />
        </div>
        <div className="grade grade-4">
          <Campo rotulo="Kcal / 100" type="number" min="0" step="1" value={form.kcal_100} onChange={alterar('kcal_100')} required />
          <Campo rotulo="Proteína / 100" type="number" min="0" step="0.1" value={form.proteina_100} onChange={alterar('proteina_100')} />
          <Campo rotulo="Carbo / 100" type="number" min="0" step="0.1" value={form.carbo_100} onChange={alterar('carbo_100')} />
          <Campo rotulo="Gordura / 100" type="number" min="0" step="0.1" value={form.gordura_100} onChange={alterar('gordura_100')} />
        </div>
        <div className="grade grade-2">
          <Campo rotulo="Porção padrão" type="number" min="1" value={form.porcao_padrao_g} onChange={alterar('porcao_padrao_g')} />
          <Campo rotulo="Unidade">
            <select value={form.unidade} onChange={alterar('unidade')}>
              <option value="g">gramas</option>
              <option value="ml">mililitros</option>
              <option value="un">unidades</option>
            </select>
          </Campo>
        </div>
        <Erro>{erro}</Erro>
        <div className="linha">
          <button type="submit" disabled={enviando}>{editandoId ? 'Salvar alterações' : 'Cadastrar alimento'}</button>
          {editandoId && (
            <button type="button" className="fantasma" onClick={() => { setEditandoId(null); setForm(ALIMENTO_VAZIO) }}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: 14 }}>
        {alimentos.length === 0 ? (
          <p className="vazio">Nenhum alimento cadastrado.</p>
        ) : (
          alimentos.map((a) => (
            <div key={a.id} className="item-lista">
              <div>
                <strong>{a.nome}</strong>{a.marca ? <span className="unidade"> · {a.marca}</span> : null}
                <div className="detalhe">
                  {numero(a.kcal_100, 0)} kcal · P {numero(a.proteina_100)} / C {numero(a.carbo_100)} /
                  G {numero(a.gordura_100)} por 100 {a.unidade}
                </div>
              </div>
              <div className="linha">
                <button type="button" className="secundario pequeno" onClick={() => editar(a)}>Editar</button>
                <button type="button" className="perigo icone" title="Excluir" onClick={() => excluir(a)}>
                  <IconeLixo />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}
