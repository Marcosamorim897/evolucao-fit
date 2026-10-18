from datetime import date, timedelta

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import obter_sessao
from ..models import RegistroAgua, Usuario
from ..schemas import AguaDia, AguaEntrada, AguaSaida
from ..security import usuario_atual

router = APIRouter(prefix="/api/agua", tags=["agua"])


@router.get("/{dia}", response_model=AguaDia)
def do_dia(
    dia: date,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    registros = list(
        sessao.scalars(
            select(RegistroAgua)
            .where(RegistroAgua.usuario_id == usuario.id, RegistroAgua.data == dia)
            .order_by(RegistroAgua.id)
        )
    )
    return AguaDia(
        data=dia,
        total_ml=sum(r.ml for r in registros),
        meta_agua_ml=usuario.meta_agua_ml,
        registros=[AguaSaida.model_validate(r) for r in registros],
    )


@router.post("", response_model=AguaDia, status_code=status.HTTP_201_CREATED)
def registrar(
    dados: AguaEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    """Soma (ou subtrai, com ml negativo) agua no dia informado."""
    sessao.add(RegistroAgua(usuario_id=usuario.id, data=dados.data, ml=dados.ml))
    sessao.commit()
    return do_dia(dados.data, usuario, sessao)


@router.delete("/{registro_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    registro_id: int,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    registro = sessao.scalar(
        select(RegistroAgua).where(
            RegistroAgua.id == registro_id, RegistroAgua.usuario_id == usuario.id
        )
    )
    if registro is not None:
        sessao.delete(registro)
        sessao.commit()


@router.get("/historico/dias/{quantidade}")
def historico(
    quantidade: int,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    inicio = date.today() - timedelta(days=max(1, min(quantidade, 90)) - 1)
    linhas = sessao.execute(
        select(RegistroAgua.data, func.sum(RegistroAgua.ml))
        .where(RegistroAgua.usuario_id == usuario.id, RegistroAgua.data >= inicio)
        .group_by(RegistroAgua.data)
        .order_by(RegistroAgua.data)
    ).all()
    return [{"data": d.isoformat(), "total_ml": int(total or 0)} for d, total in linhas]
