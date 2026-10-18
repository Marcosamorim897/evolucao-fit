from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool

from .config import DATABASE_URL


class Base(DeclarativeBase):
    pass


def _url_normalizada() -> str:
    if not DATABASE_URL:
        # Desenvolvimento local sem Neon: cai para um SQLite no diretorio do projeto.
        return "sqlite:///./evolucao-fit.db"
    url = DATABASE_URL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql://"):
        # psycopg 3 (driver "psycopg"): tem wheel pronto para todas as versoes de
        # Python usadas pela Vercel, diferente do psycopg2, que exigiria compilar.
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


def _criar_engine():
    url = _url_normalizada()
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})
    # Em serverless cada invocacao e um processo novo: pool nao se reaproveita e
    # conexoes ociosas do Neon sao fechadas. NullPool evita os 500 de conexao morta.
    return create_engine(url, poolclass=NullPool, pool_pre_ping=True)


engine = _criar_engine()
Sessao = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def obter_sessao():
    sessao = Sessao()
    try:
        yield sessao
    finally:
        sessao.close()
