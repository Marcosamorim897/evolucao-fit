"""Cria as tabelas no banco apontado por DATABASE_URL.

Uso:
    DATABASE_URL="postgresql://..." python3 scripts/init_db.py
Sem DATABASE_URL, cria um SQLite local (evolucao-fit.db) para desenvolvimento.
"""
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, "api"))

from app.db import _url_normalizada  # noqa: E402
from app.main import criar_tabelas  # noqa: E402

if __name__ == "__main__":
    destino = _url_normalizada()
    print(f"Criando tabelas em: {destino.split('@')[-1]}")
    criar_tabelas()
    print("Pronto.")
