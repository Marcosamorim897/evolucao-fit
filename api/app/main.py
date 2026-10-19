from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from .routers import agua, alimentacao, auth, fichas, medidas, plano, resumo, treinos


def criar_app() -> FastAPI:
    app = FastAPI(title="EvolucaoFit API", docs_url="/api/docs", openapi_url="/api/openapi.json")

    # Em dev o Vite roda em outra porta; em producao front e API saem do mesmo dominio.
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    for modulo in (auth, fichas, treinos, medidas, alimentacao, agua, plano, resumo):
        app.include_router(modulo.router)

    @app.get("/api/saude")
    def saude():
        from sqlalchemy import text

        with engine.connect() as conexao:
            conexao.execute(text("SELECT 1"))
        return {"status": "ok"}

    return app


def criar_tabelas() -> None:
    """Cria as tabelas que faltam. Rodado pelo scripts/init_db.py, nunca no request."""
    Base.metadata.create_all(engine)
