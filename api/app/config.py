import os


def _limpar(valor: str) -> str:
    return (valor or "").strip()


DATABASE_URL = _limpar(os.environ.get("DATABASE_URL", ""))
JWT_SECRET = _limpar(os.environ.get("JWT_SECRET", "")) or "dev-secret-nao-use-em-producao"
JWT_ALGORITMO = "HS256"
JWT_DIAS_VALIDADE = 30
CODIGO_CONVITE = _limpar(os.environ.get("CODIGO_CONVITE", ""))
FUSO_PADRAO = "America/Sao_Paulo"
