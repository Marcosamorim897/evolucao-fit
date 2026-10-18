from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import JWT_ALGORITMO, JWT_DIAS_VALIDADE, JWT_SECRET
from .db import obter_sessao
from .models import Usuario

esquema = HTTPBearer(auto_error=False)


def gerar_hash(senha: str) -> str:
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def senha_confere(senha: str, senha_hash: str) -> bool:
    try:
        return bcrypt.checkpw(senha.encode("utf-8"), senha_hash.encode("utf-8"))
    except ValueError:
        return False


def criar_token(usuario_id: int) -> str:
    agora = datetime.now(timezone.utc)
    carga = {
        "sub": str(usuario_id),
        "iat": int(agora.timestamp()),
        "exp": int((agora + timedelta(days=JWT_DIAS_VALIDADE)).timestamp()),
    }
    return jwt.encode(carga, JWT_SECRET, algorithm=JWT_ALGORITMO)


def usuario_atual(
    credenciais: HTTPAuthorizationCredentials | None = Depends(esquema),
    sessao: Session = Depends(obter_sessao),
) -> Usuario:
    nao_autorizado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sessao expirada ou invalida. Entre novamente.",
    )
    if credenciais is None:
        raise nao_autorizado
    try:
        carga = jwt.decode(credenciais.credentials, JWT_SECRET, algorithms=[JWT_ALGORITMO])
    except jwt.PyJWTError:
        raise nao_autorizado
    usuario = sessao.get(Usuario, int(carga.get("sub", 0)))
    if usuario is None:
        raise nao_autorizado
    return usuario
