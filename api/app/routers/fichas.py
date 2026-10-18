from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..db import obter_sessao
from ..models import Exercicio, Ficha, Usuario
from ..schemas import FichaEntrada, FichaSaida
from ..security import usuario_atual

router = APIRouter(prefix="/api/fichas", tags=["fichas"])


def _buscar(sessao: Session, usuario: Usuario, ficha_id: int) -> Ficha:
    ficha = sessao.scalar(
        select(Ficha)
        .where(Ficha.id == ficha_id, Ficha.usuario_id == usuario.id)
        .options(selectinload(Ficha.exercicios))
    )
    if ficha is None:
        raise HTTPException(status_code=404, detail="Ficha nao encontrada.")
    return ficha


@router.get("", response_model=list[FichaSaida])
def listar(usuario: Usuario = Depends(usuario_atual), sessao: Session = Depends(obter_sessao)):
    return list(
        sessao.scalars(
            select(Ficha)
            .where(Ficha.usuario_id == usuario.id)
            .options(selectinload(Ficha.exercicios))
            .order_by(Ficha.ordem, Ficha.id)
        )
    )


@router.post("", response_model=FichaSaida, status_code=status.HTTP_201_CREATED)
def criar(
    dados: FichaEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    maior = sessao.scalar(
        select(Ficha.ordem).where(Ficha.usuario_id == usuario.id).order_by(Ficha.ordem.desc()).limit(1)
    )
    ficha = Ficha(
        usuario_id=usuario.id,
        nome=dados.nome.strip(),
        foco=dados.foco,
        observacoes=dados.observacoes,
        ativa=dados.ativa,
        ordem=(maior or 0) + 1,
    )
    for i, ex in enumerate(dados.exercicios):
        ficha.exercicios.append(Exercicio(ordem=i, **ex.model_dump()))
    sessao.add(ficha)
    sessao.commit()
    return _buscar(sessao, usuario, ficha.id)


@router.put("/{ficha_id}", response_model=FichaSaida)
def atualizar(
    ficha_id: int,
    dados: FichaEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    ficha = _buscar(sessao, usuario, ficha_id)
    ficha.nome = dados.nome.strip()
    ficha.foco = dados.foco
    ficha.observacoes = dados.observacoes
    ficha.ativa = dados.ativa
    # A lista enviada pela tela e a verdade: recria os exercicios na ordem recebida.
    ficha.exercicios.clear()
    sessao.flush()
    for i, ex in enumerate(dados.exercicios):
        ficha.exercicios.append(Exercicio(ordem=i, **ex.model_dump()))
    sessao.commit()
    return _buscar(sessao, usuario, ficha_id)


@router.delete("/{ficha_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    ficha_id: int,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    ficha = _buscar(sessao, usuario, ficha_id)
    sessao.delete(ficha)
    sessao.commit()
