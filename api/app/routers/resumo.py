from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..db import obter_sessao
from ..models import ItemRefeicao, Medida, RegistroAgua, Treino, Usuario
from ..security import usuario_atual

router = APIRouter(prefix="/api/resumo", tags=["resumo"])


@router.get("")
def resumo(
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    hoje = date.today()
    inicio_semana = hoje - timedelta(days=hoje.weekday())
    sete_dias = hoje - timedelta(days=6)

    agua_hoje = sessao.scalar(
        select(func.coalesce(func.sum(RegistroAgua.ml), 0)).where(
            RegistroAgua.usuario_id == usuario.id, RegistroAgua.data == hoje
        )
    )
    kcal_hoje, prot_hoje = sessao.execute(
        select(
            func.coalesce(func.sum(ItemRefeicao.kcal), 0.0),
            func.coalesce(func.sum(ItemRefeicao.proteina_g), 0.0),
        ).where(ItemRefeicao.usuario_id == usuario.id, ItemRefeicao.data == hoje)
    ).one()

    treinos_hoje = list(
        sessao.scalars(
            select(Treino)
            .where(Treino.usuario_id == usuario.id, Treino.data == hoje)
            .options(selectinload(Treino.ficha))
        )
    )
    treinos_semana = sessao.scalar(
        select(func.count(Treino.id)).where(
            Treino.usuario_id == usuario.id, Treino.data >= inicio_semana, Treino.data <= hoje
        )
    )

    datas_treino = set(
        sessao.scalars(select(Treino.data).where(Treino.usuario_id == usuario.id))
    )
    sequencia = 0
    cursor = hoje if hoje in datas_treino else hoje - timedelta(days=1)
    while cursor in datas_treino:
        sequencia += 1
        cursor -= timedelta(days=1)

    medidas = list(
        sessao.scalars(
            select(Medida)
            .where(Medida.usuario_id == usuario.id, Medida.peso_kg.is_not(None))
            .order_by(Medida.data.desc())
            .limit(2)
        )
    )
    peso_atual = medidas[0].peso_kg if medidas else None
    variacao_peso = (
        round(medidas[0].peso_kg - medidas[1].peso_kg, 1) if len(medidas) == 2 else None
    )
    imc = None
    if peso_atual and usuario.altura_cm:
        imc = round(peso_atual / ((usuario.altura_cm / 100) ** 2), 1)

    kcal_por_dia = {
        d.isoformat(): round(float(total or 0), 1)
        for d, total in sessao.execute(
            select(ItemRefeicao.data, func.sum(ItemRefeicao.kcal))
            .where(ItemRefeicao.usuario_id == usuario.id, ItemRefeicao.data >= sete_dias)
            .group_by(ItemRefeicao.data)
        ).all()
    }
    agua_por_dia = {
        d.isoformat(): int(total or 0)
        for d, total in sessao.execute(
            select(RegistroAgua.data, func.sum(RegistroAgua.ml))
            .where(RegistroAgua.usuario_id == usuario.id, RegistroAgua.data >= sete_dias)
            .group_by(RegistroAgua.data)
        ).all()
    }
    ultimos_7 = []
    for i in range(7):
        dia = sete_dias + timedelta(days=i)
        chave = dia.isoformat()
        ultimos_7.append(
            {
                "data": chave,
                "kcal": kcal_por_dia.get(chave, 0),
                "agua_ml": agua_por_dia.get(chave, 0),
                "treinou": dia in datas_treino,
            }
        )

    return {
        "hoje": hoje.isoformat(),
        "agua": {"total_ml": int(agua_hoje or 0), "meta_ml": usuario.meta_agua_ml},
        "calorias": {
            "total": round(float(kcal_hoje or 0), 1),
            "meta": usuario.meta_calorias,
            "proteina_g": round(float(prot_hoje or 0), 1),
            "meta_proteina_g": usuario.meta_proteina_g,
        },
        "treino": {
            "hoje": [
                {
                    "id": t.id,
                    "titulo": t.titulo or (t.ficha.nome if t.ficha else "Treino"),
                    "duracao_min": t.duracao_min,
                }
                for t in treinos_hoje
            ],
            "treinos_na_semana": int(treinos_semana or 0),
            "sequencia_atual": sequencia,
        },
        "corpo": {"peso_kg": peso_atual, "variacao": variacao_peso, "imc": imc},
        "ultimos_7_dias": ultimos_7,
    }
