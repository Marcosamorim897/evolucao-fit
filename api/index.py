"""Entrypoint das funcoes serverless Python da Vercel.

A Vercel procura uma variavel chamada `app` (ASGI) neste arquivo.
O sys.path garante que o pacote `app/` seja importavel tanto na Vercel
quanto rodando uvicorn localmente.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import criar_app  # noqa: E402

app = criar_app()
