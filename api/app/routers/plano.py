from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import engine, obter_sessao
from ..models import Alimento, ItemRefeicao, PlanoAlimentar, RegistroAgua, Usuario
from ..schemas import ItemSaida, LancarPlanoEntrada, PlanoDados
from ..security import usuario_atual
from .alimentacao import macros_da_porcao

router = APIRouter(prefix="/api/plano", tags=["plano"])

_tabela_pronta = False


def _garantir_tabela() -> None:
    # A tabela entrou depois do primeiro deploy e o init_db.py so roda da maquina
    # de quem tem a DATABASE_URL. Criar sob demanda (uma vez por processo) evita
    # que o deploy dependa desse passo manual.
    global _tabela_pronta
    if not _tabela_pronta:
        PlanoAlimentar.__table__.create(engine, checkfirst=True)
        _tabela_pronta = True


def _plano_do_usuario(sessao: Session, usuario: Usuario) -> PlanoAlimentar | None:
    _garantir_tabela()
    return sessao.scalar(select(PlanoAlimentar).where(PlanoAlimentar.usuario_id == usuario.id))


@router.get("", response_model=PlanoDados | None)
def obter(usuario: Usuario = Depends(usuario_atual), sessao: Session = Depends(obter_sessao)):
    plano = _plano_do_usuario(sessao, usuario)
    return PlanoDados.model_validate_json(plano.conteudo) if plano else None


@router.put("", response_model=PlanoDados)
def salvar(
    dados: PlanoDados,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    plano = _plano_do_usuario(sessao, usuario)
    if plano is None:
        plano = PlanoAlimentar(usuario_id=usuario.id)
        sessao.add(plano)
    plano.conteudo = dados.model_dump_json()
    sessao.commit()
    return dados


@router.post("/lancar", response_model=list[ItemSaida], status_code=status.HTTP_201_CREATED)
def lancar(
    dados: LancarPlanoEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    """Registra no diario do dia os alimentos escolhidos de uma refeicao do plano."""
    registro = _plano_do_usuario(sessao, usuario)
    if registro is None:
        raise HTTPException(status_code=404, detail="Nenhum plano alimentar cadastrado.")
    plano = PlanoDados.model_validate_json(registro.conteudo)
    try:
        refeicao = plano.refeicoes[dados.refeicao]
        opcao = refeicao.opcoes[dados.opcao]
    except IndexError:
        raise HTTPException(status_code=400, detail="Refeicao ou opcao inexistente no plano.")

    grupos = {g.nome: g.escolhas for g in plano.grupos}
    criados: list[ItemRefeicao] = []
    for indice, item in enumerate(opcao.itens):
        if item.agua_ml:
            sessao.add(RegistroAgua(usuario_id=usuario.id, data=dados.data, ml=item.agua_ml))
        candidatos = item.escolhas or grupos.get(item.grupo or "", [])
        if not candidatos:
            continue
        escolha = candidatos[min(dados.escolhas.get(indice, 0), len(candidatos) - 1)]
        if escolha.gramas is None:
            continue
        alimento = sessao.scalar(
            select(Alimento).where(
                Alimento.usuario_id == usuario.id,
                func.lower(Alimento.nome) == escolha.alimento.lower(),
            )
        )
        if alimento is None:
            raise HTTPException(
                status_code=400,
                detail=f'"{escolha.alimento}" nao esta em Meus alimentos. Cadastre-o para lancar.',
            )
        kcal, prot, carb, gord = macros_da_porcao(alimento, escolha.gramas)
        novo = ItemRefeicao(
            usuario_id=usuario.id,
            data=dados.data,
            refeicao=refeicao.refeicao,
            alimento_id=alimento.id,
            descricao=alimento.nome,
            quantidade=escolha.gramas,
            kcal=kcal,
            proteina_g=prot,
            carbo_g=carb,
            gordura_g=gord,
        )
        sessao.add(novo)
        criados.append(novo)

    sessao.commit()
    for novo in criados:
        sessao.refresh(novo)
    return criados
