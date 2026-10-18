from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import CODIGO_CONVITE
from ..db import obter_sessao
from ..models import Alimento, Usuario
from ..schemas import CadastroEntrada, LoginEntrada, MetasEntrada, TokenSaida, UsuarioSaida
from ..security import criar_token, gerar_hash, senha_confere, usuario_atual

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Alguns alimentos para a lista nao nascer vazia (valores por 100 g).
ALIMENTOS_INICIAIS = [
    ("Arroz branco cozido", 128, 2.5, 28.1, 0.2, 150),
    ("Feijao carioca cozido", 76, 4.8, 13.6, 0.5, 120),
    ("Peito de frango grelhado", 159, 32.0, 0.0, 2.5, 150),
    ("Ovo cozido", 146, 13.3, 0.6, 9.5, 50),
    ("Batata doce cozida", 77, 0.6, 18.4, 0.1, 150),
    ("Whey protein (po)", 400, 80.0, 8.0, 5.0, 30),
    ("Banana prata", 98, 1.3, 26.0, 0.1, 90),
    ("Aveia em flocos", 394, 13.9, 66.6, 8.5, 40),
]


@router.post("/registrar", response_model=TokenSaida, status_code=status.HTTP_201_CREATED)
def registrar(dados: CadastroEntrada, sessao: Session = Depends(obter_sessao)):
    if CODIGO_CONVITE and (dados.codigo_convite or "").strip() != CODIGO_CONVITE:
        raise HTTPException(status_code=403, detail="Codigo de convite invalido.")
    email = dados.email.lower().strip()
    if sessao.scalar(select(Usuario).where(Usuario.email == email)):
        raise HTTPException(status_code=409, detail="Ja existe uma conta com esse e-mail.")

    usuario = Usuario(nome=dados.nome.strip(), email=email, senha_hash=gerar_hash(dados.senha))
    sessao.add(usuario)
    sessao.flush()
    for nome, kcal, prot, carb, gord, porcao in ALIMENTOS_INICIAIS:
        sessao.add(
            Alimento(
                usuario_id=usuario.id,
                nome=nome,
                kcal_100=kcal,
                proteina_100=prot,
                carbo_100=carb,
                gordura_100=gord,
                porcao_padrao_g=porcao,
            )
        )
    sessao.commit()
    return TokenSaida(token=criar_token(usuario.id), usuario=UsuarioSaida.model_validate(usuario))


@router.post("/login", response_model=TokenSaida)
def login(dados: LoginEntrada, sessao: Session = Depends(obter_sessao)):
    usuario = sessao.scalar(select(Usuario).where(Usuario.email == dados.email.lower().strip()))
    if usuario is None or not senha_confere(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    return TokenSaida(token=criar_token(usuario.id), usuario=UsuarioSaida.model_validate(usuario))


@router.get("/eu", response_model=UsuarioSaida)
def eu(usuario: Usuario = Depends(usuario_atual)):
    return usuario


@router.put("/eu", response_model=UsuarioSaida)
def atualizar_metas(
    dados: MetasEntrada,
    usuario: Usuario = Depends(usuario_atual),
    sessao: Session = Depends(obter_sessao),
):
    usuario = sessao.merge(usuario)
    for campo, valor in dados.model_dump(exclude_none=True).items():
        setattr(usuario, campo, valor)
    sessao.commit()
    return usuario
