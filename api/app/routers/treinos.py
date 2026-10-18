from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..db import obter_sessao
from ..models import Ficha, SerieRealizada, Treino, Usuario
from ..schemas import TreinoEntrada, TreinoSaida
from ..security import usuario_atual

router = APIRouter(prefix="/api/treinos", tags=["treinos"])


def _saida(treino: Treino) -> TreinoSaida:
    dados = TreinoSaida.model_validate(treino)
    dados.ficha_nome = treino.ficha.nome if treino.ficha else None
    return dados


@router.get("", response_model=list[TreinoSaida])
def listar(
    inicio: date | None = None,
    fim: date | None = None,
    limite: int = Query(default=200, ge=1, le=500),
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    consulta = (
        select(Treino)
        .where(Treino.usuario_id == usuario.id)
        .options(selectinload(Treino.series), selectinload(Treino.ficha))
        .order_by(Treino.data.desc(), Treino.id.desc())
        .limit(limite)
    )
    if inicio:
        consulta = consulta.where(Treino.data >= inicio)
    if fim:
        consulta = consulta.where(Treino.data <= fim)
    return [_saida(t) for t in sessao.scalars(consulta)]


@router.post("", response_model=TreinoSaida, status_code=status.HTTP_201_CREATED)
def registrar(
    dados: TreinoEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    if dados.ficha_id is not None:
        ficha = sessao.scalar(
            select(Ficha).where(Ficha.id == dados.ficha_id, Ficha.usuario_id == usuario.id)
        )
        if ficha is None:
            raise HTTPException(status_code=404, detail="Ficha nao encontrada.")

    treino = Treino(
        usuario_id=usuario.id,
        data=dados.data,
        ficha_id=dados.ficha_id,
        titulo=dados.titulo,
        duracao_min=dados.duracao_min,
        notas=dados.notas,
    )
    for serie in dados.series:
        if serie.carga_kg is None and not serie.repeticoes:
            continue
        treino.series.append(SerieRealizada(**serie.model_dump()))
    sessao.add(treino)
    sessao.commit()
    sessao.refresh(treino)
    return _saida(treino)


@router.put("/{treino_id}", response_model=TreinoSaida)
def atualizar(
    treino_id: int,
    dados: TreinoEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    treino = sessao.scalar(
        select(Treino)
        .where(Treino.id == treino_id, Treino.usuario_id == usuario.id)
        .options(selectinload(Treino.series))
    )
    if treino is None:
        raise HTTPException(status_code=404, detail="Treino nao encontrado.")
    treino.data = dados.data
    treino.ficha_id = dados.ficha_id
    treino.titulo = dados.titulo
    treino.duracao_min = dados.duracao_min
    treino.notas = dados.notas
    treino.series.clear()
    sessao.flush()
    for serie in dados.series:
        if serie.carga_kg is None and not serie.repeticoes:
            continue
        treino.series.append(SerieRealizada(**serie.model_dump()))
    sessao.commit()
    sessao.refresh(treino)
    return _saida(treino)


@router.delete("/{treino_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    treino_id: int,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    treino = sessao.scalar(
        select(Treino).where(Treino.id == treino_id, Treino.usuario_id == usuario.id)
    )
    if treino is None:
        raise HTTPException(status_code=404, detail="Treino nao encontrado.")
    sessao.delete(treino)
    sessao.commit()


@router.get("/ultima-carga/{exercicio_id}")
def ultima_carga(
    exercicio_id: int,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    """Ultima carga/reps registrada para o exercicio, para pre-preencher o formulario."""
    serie = sessao.scalar(
        select(SerieRealizada)
        .join(Treino, Treino.id == SerieRealizada.treino_id)
        .where(Treino.usuario_id == usuario.id, SerieRealizada.exercicio_id == exercicio_id)
        .order_by(Treino.data.desc(), SerieRealizada.id.desc())
        .limit(1)
    )
    if serie is None:
        return {"carga_kg": None, "repeticoes": None}
    return {"carga_kg": serie.carga_kg, "repeticoes": serie.repeticoes}


@router.get("/calendario/{ano}/{mes}")
def calendario(
    ano: int,
    mes: int,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    """Dias treinados do mes + sequencia atual de dias seguidos treinando."""
    if not 1 <= mes <= 12:
        raise HTTPException(status_code=400, detail="Mes invalido.")
    primeiro = date(ano, mes, 1)
    ultimo = date(ano + (mes == 12), (mes % 12) + 1, 1) - timedelta(days=1)

    treinos = list(
        sessao.scalars(
            select(Treino)
            .where(Treino.usuario_id == usuario.id, Treino.data >= primeiro, Treino.data <= ultimo)
            .options(selectinload(Treino.ficha))
            .order_by(Treino.data)
        )
    )
    dias: dict[str, list[dict]] = {}
    for treino in treinos:
        chave = treino.data.isoformat()
        dias.setdefault(chave, []).append(
            {
                "id": treino.id,
                "titulo": treino.titulo or (treino.ficha.nome if treino.ficha else "Treino"),
                "duracao_min": treino.duracao_min,
            }
        )

    todas_datas = set(
        sessao.scalars(
            select(Treino.data).where(Treino.usuario_id == usuario.id).order_by(Treino.data.desc())
        )
    )
    hoje = date.today()
    sequencia = 0
    cursor = hoje if hoje in todas_datas else hoje - timedelta(days=1)
    while cursor in todas_datas:
        sequencia += 1
        cursor -= timedelta(days=1)

    return {
        "ano": ano,
        "mes": mes,
        "dias": dias,
        "total_no_mes": len(treinos),
        "sequencia_atual": sequencia,
    }
