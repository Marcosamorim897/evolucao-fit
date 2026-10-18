from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import obter_sessao
from ..models import Medida, Usuario
from ..schemas import MedidaEntrada, MedidaSaida
from ..security import usuario_atual

router = APIRouter(prefix="/api/medidas", tags=["medidas"])


@router.get("", response_model=list[MedidaSaida])
def listar(
    limite: int = Query(default=120, ge=1, le=500),
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    return list(
        sessao.scalars(
            select(Medida)
            .where(Medida.usuario_id == usuario.id)
            .order_by(Medida.data.desc())
            .limit(limite)
        )
    )


@router.post("", response_model=MedidaSaida, status_code=status.HTTP_201_CREATED)
def salvar(
    dados: MedidaEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    """Cria a medida do dia ou atualiza a que ja existe nessa data."""
    medida = sessao.scalar(
        select(Medida).where(Medida.usuario_id == usuario.id, Medida.data == dados.data)
    )
    if medida is None:
        medida = Medida(usuario_id=usuario.id, data=dados.data)
        sessao.add(medida)
    for campo, valor in dados.model_dump().items():
        setattr(medida, campo, valor)
    sessao.commit()
    sessao.refresh(medida)
    return medida


@router.delete("/{medida_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    medida_id: int,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    medida = sessao.scalar(
        select(Medida).where(Medida.id == medida_id, Medida.usuario_id == usuario.id)
    )
    if medida is None:
        raise HTTPException(status_code=404, detail="Medida nao encontrada.")
    sessao.delete(medida)
    sessao.commit()
