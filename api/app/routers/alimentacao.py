from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import obter_sessao
from ..models import Alimento, ItemRefeicao, Usuario
from ..schemas import (
    REFEICOES,
    AlimentoEntrada,
    AlimentoSaida,
    DiarioSaida,
    ItemEntrada,
    ItemSaida,
    TotaisDia,
)
from ..security import usuario_atual

router = APIRouter(prefix="/api", tags=["alimentacao"])


# ----- biblioteca de alimentos -----
@router.get("/alimentos", response_model=list[AlimentoSaida])
def listar_alimentos(
    usuario: Usuario = Depends(usuario_atual), sessao: Session = Depends(obter_sessao)
):
    return list(
        sessao.scalars(
            select(Alimento).where(Alimento.usuario_id == usuario.id).order_by(Alimento.nome)
        )
    )


@router.post("/alimentos", response_model=AlimentoSaida, status_code=status.HTTP_201_CREATED)
def criar_alimento(
    dados: AlimentoEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    alimento = Alimento(usuario_id=usuario.id, **dados.model_dump())
    alimento.nome = alimento.nome.strip()
    sessao.add(alimento)
    sessao.commit()
    sessao.refresh(alimento)
    return alimento


@router.put("/alimentos/{alimento_id}", response_model=AlimentoSaida)
def atualizar_alimento(
    alimento_id: int,
    dados: AlimentoEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    alimento = _buscar_alimento(sessao, usuario, alimento_id)
    for campo, valor in dados.model_dump().items():
        setattr(alimento, campo, valor)
    sessao.commit()
    sessao.refresh(alimento)
    return alimento


@router.delete("/alimentos/{alimento_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_alimento(
    alimento_id: int,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    sessao.delete(_buscar_alimento(sessao, usuario, alimento_id))
    sessao.commit()


def macros_da_porcao(alimento: Alimento, quantidade: float) -> tuple[float, float, float, float]:
    """kcal, proteina, carbo e gordura de `quantidade` g/ml do alimento."""
    fator = quantidade / 100.0
    return (
        round(alimento.kcal_100 * fator, 1),
        round(alimento.proteina_100 * fator, 1),
        round(alimento.carbo_100 * fator, 1),
        round(alimento.gordura_100 * fator, 1),
    )


def _buscar_alimento(sessao: Session, usuario: Usuario, alimento_id: int) -> Alimento:
    alimento = sessao.scalar(
        select(Alimento).where(Alimento.id == alimento_id, Alimento.usuario_id == usuario.id)
    )
    if alimento is None:
        raise HTTPException(status_code=404, detail="Alimento nao encontrado.")
    return alimento


# ----- diario de refeicoes -----
@router.get("/refeicoes/{dia}", response_model=DiarioSaida)
def diario(
    dia: date,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    itens = list(
        sessao.scalars(
            select(ItemRefeicao)
            .where(ItemRefeicao.usuario_id == usuario.id, ItemRefeicao.data == dia)
            .order_by(ItemRefeicao.id)
        )
    )
    totais = TotaisDia(
        kcal=round(sum(i.kcal for i in itens), 1),
        proteina_g=round(sum(i.proteina_g for i in itens), 1),
        carbo_g=round(sum(i.carbo_g for i in itens), 1),
        gordura_g=round(sum(i.gordura_g for i in itens), 1),
    )
    return DiarioSaida(
        data=dia,
        itens=[ItemSaida.model_validate(i) for i in itens],
        totais=totais,
        meta_calorias=usuario.meta_calorias,
        meta_proteina_g=usuario.meta_proteina_g,
    )


@router.post("/refeicoes", response_model=ItemSaida, status_code=status.HTTP_201_CREATED)
def adicionar_item(
    dados: ItemEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    if dados.refeicao not in REFEICOES:
        raise HTTPException(status_code=400, detail="Refeicao invalida.")

    descricao = (dados.descricao or "").strip()
    kcal, prot, carb, gord = dados.kcal, dados.proteina_g, dados.carbo_g, dados.gordura_g

    if dados.alimento_id is not None:
        alimento = _buscar_alimento(sessao, usuario, dados.alimento_id)
        kcal, prot, carb, gord = macros_da_porcao(alimento, dados.quantidade)
        descricao = descricao or alimento.nome
    elif not descricao:
        raise HTTPException(
            status_code=400, detail="Informe um alimento da lista ou uma descricao."
        )

    item = ItemRefeicao(
        usuario_id=usuario.id,
        data=dados.data,
        refeicao=dados.refeicao,
        alimento_id=dados.alimento_id,
        descricao=descricao,
        quantidade=dados.quantidade,
        kcal=kcal or 0,
        proteina_g=prot or 0,
        carbo_g=carb or 0,
        gordura_g=gord or 0,
    )
    sessao.add(item)
    sessao.commit()
    sessao.refresh(item)
    return item


@router.delete("/refeicoes/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_item(
    item_id: int,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    item = sessao.scalar(
        select(ItemRefeicao).where(
            ItemRefeicao.id == item_id, ItemRefeicao.usuario_id == usuario.id
        )
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado.")
    sessao.delete(item)
    sessao.commit()
