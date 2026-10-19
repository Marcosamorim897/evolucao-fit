from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

REFEICOES = ("cafe", "almoco", "cafe_tarde", "jantar", "ceia", "lanche")


class Modelo(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ----- autenticacao -----
class CadastroEntrada(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    email: EmailStr
    senha: str = Field(min_length=6, max_length=100)
    codigo_convite: str | None = None


class LoginEntrada(BaseModel):
    email: EmailStr
    senha: str


class UsuarioSaida(Modelo):
    id: int
    nome: str
    email: EmailStr
    meta_agua_ml: int
    meta_calorias: int
    meta_proteina_g: int
    altura_cm: float | None


class TokenSaida(BaseModel):
    token: str
    usuario: UsuarioSaida


class MetasEntrada(BaseModel):
    nome: str | None = Field(default=None, min_length=2, max_length=120)
    meta_agua_ml: int | None = Field(default=None, ge=200, le=10000)
    meta_calorias: int | None = Field(default=None, ge=500, le=10000)
    meta_proteina_g: int | None = Field(default=None, ge=20, le=500)
    altura_cm: float | None = Field(default=None, ge=100, le=250)


# ----- fichas -----
class ExercicioEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=140)
    grupo_muscular: str | None = None
    series: int = Field(default=3, ge=1, le=20)
    repeticoes: str = Field(default="10", max_length=40)
    carga_kg: float | None = Field(default=None, ge=0, le=1000)
    descanso_seg: int | None = Field(default=None, ge=0, le=900)
    observacoes: str | None = None


class ExercicioSaida(Modelo):
    id: int
    nome: str
    grupo_muscular: str | None
    series: int
    repeticoes: str
    carga_kg: float | None
    descanso_seg: int | None
    observacoes: str | None
    ordem: int


class FichaEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    foco: str | None = None
    observacoes: str | None = None
    ativa: bool = True
    exercicios: list[ExercicioEntrada] = []


class FichaSaida(Modelo):
    id: int
    nome: str
    foco: str | None
    observacoes: str | None
    ativa: bool
    ordem: int
    exercicios: list[ExercicioSaida]


# ----- treinos -----
class SerieEntrada(BaseModel):
    exercicio_id: int | None = None
    nome_exercicio: str
    series: int | None = None
    repeticoes: str | None = None
    carga_kg: float | None = Field(default=None, ge=0, le=1000)


class SerieSaida(Modelo):
    id: int
    exercicio_id: int | None
    nome_exercicio: str
    series: int | None
    repeticoes: str | None
    carga_kg: float | None


class TreinoEntrada(BaseModel):
    data: date
    ficha_id: int | None = None
    titulo: str | None = None
    duracao_min: int | None = Field(default=None, ge=1, le=600)
    notas: str | None = None
    series: list[SerieEntrada] = []


class TreinoSaida(Modelo):
    id: int
    data: date
    ficha_id: int | None
    ficha_nome: str | None = None
    titulo: str | None
    duracao_min: int | None
    notas: str | None
    series: list[SerieSaida]


# ----- medidas -----
CAMPOS_MEDIDA = (
    "peso_kg",
    "gordura_pct",
    "pescoco_cm",
    "ombro_cm",
    "peito_cm",
    "cintura_cm",
    "abdomen_cm",
    "quadril_cm",
    "braco_d_cm",
    "braco_e_cm",
    "antebraco_d_cm",
    "antebraco_e_cm",
    "coxa_d_cm",
    "coxa_e_cm",
    "panturrilha_d_cm",
    "panturrilha_e_cm",
)


class MedidaEntrada(BaseModel):
    data: date
    peso_kg: float | None = Field(default=None, ge=20, le=400)
    gordura_pct: float | None = Field(default=None, ge=1, le=70)
    pescoco_cm: float | None = Field(default=None, ge=10, le=100)
    ombro_cm: float | None = Field(default=None, ge=40, le=250)
    peito_cm: float | None = Field(default=None, ge=40, le=250)
    cintura_cm: float | None = Field(default=None, ge=30, le=250)
    abdomen_cm: float | None = Field(default=None, ge=30, le=250)
    quadril_cm: float | None = Field(default=None, ge=30, le=250)
    braco_d_cm: float | None = Field(default=None, ge=10, le=100)
    braco_e_cm: float | None = Field(default=None, ge=10, le=100)
    antebraco_d_cm: float | None = Field(default=None, ge=10, le=100)
    antebraco_e_cm: float | None = Field(default=None, ge=10, le=100)
    coxa_d_cm: float | None = Field(default=None, ge=20, le=150)
    coxa_e_cm: float | None = Field(default=None, ge=20, le=150)
    panturrilha_d_cm: float | None = Field(default=None, ge=15, le=100)
    panturrilha_e_cm: float | None = Field(default=None, ge=15, le=100)
    observacoes: str | None = None


class MedidaSaida(MedidaEntrada, Modelo):
    id: int


# ----- alimentacao -----
class AlimentoEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=140)
    marca: str | None = None
    kcal_100: float = Field(default=0, ge=0, le=2000)
    proteina_100: float = Field(default=0, ge=0, le=200)
    carbo_100: float = Field(default=0, ge=0, le=200)
    gordura_100: float = Field(default=0, ge=0, le=200)
    porcao_padrao_g: float = Field(default=100, gt=0, le=5000)
    unidade: Literal["g", "ml", "un"] = "g"


class AlimentoSaida(AlimentoEntrada, Modelo):
    id: int


class ItemEntrada(BaseModel):
    data: date
    refeicao: str = "almoco"
    alimento_id: int | None = None
    descricao: str | None = None
    quantidade: float = Field(default=100, gt=0, le=10000)
    kcal: float | None = Field(default=None, ge=0, le=10000)
    proteina_g: float | None = Field(default=None, ge=0, le=1000)
    carbo_g: float | None = Field(default=None, ge=0, le=1000)
    gordura_g: float | None = Field(default=None, ge=0, le=1000)


class ItemSaida(Modelo):
    id: int
    data: date
    refeicao: str
    alimento_id: int | None
    descricao: str
    quantidade: float
    kcal: float
    proteina_g: float
    carbo_g: float
    gordura_g: float


class TotaisDia(BaseModel):
    kcal: float = 0
    proteina_g: float = 0
    carbo_g: float = 0
    gordura_g: float = 0


class DiarioSaida(BaseModel):
    data: date
    itens: list[ItemSaida]
    totais: TotaisDia
    meta_calorias: int
    meta_proteina_g: int


# ----- agua -----
class AguaEntrada(BaseModel):
    data: date
    ml: int = Field(ge=-3000, le=3000)


class AguaSaida(Modelo):
    id: int
    data: date
    ml: int


class AguaDia(BaseModel):
    data: date
    total_ml: int
    meta_agua_ml: int
    registros: list[AguaSaida]


# ----- plano alimentar -----
class EscolhaPlano(BaseModel):
    """Uma opcao de alimento. Sem `gramas`, so aparece no plano (ex.: vegetais a vontade)."""

    alimento: str = Field(min_length=1, max_length=140)
    gramas: float | None = Field(default=None, gt=0, le=5000)
    texto: str | None = Field(default=None, max_length=120)


class ItemPlano(BaseModel):
    rotulo: str = Field(min_length=1, max_length=120)
    escolhas: list[EscolhaPlano] = []
    grupo: str | None = None
    texto: str | None = Field(default=None, max_length=200)
    agua_ml: int | None = Field(default=None, gt=0, le=3000)


class OpcaoPlano(BaseModel):
    nome: str = Field(min_length=1, max_length=60)
    itens: list[ItemPlano]


class RefeicaoPlano(BaseModel):
    horario: str = Field(pattern=r"^\d{2}:\d{2}$")
    nome: str = Field(min_length=1, max_length=60)
    refeicao: Literal[REFEICOES]
    obs: str | None = Field(default=None, max_length=200)
    opcoes: list[OpcaoPlano] = Field(min_length=1)


class GrupoPlano(BaseModel):
    nome: str = Field(min_length=1, max_length=60)
    descricao: str | None = Field(default=None, max_length=200)
    escolhas: list[EscolhaPlano]


class PlanoDados(BaseModel):
    refeicoes: list[RefeicaoPlano]
    grupos: list[GrupoPlano] = []


class LancarPlanoEntrada(BaseModel):
    data: date
    refeicao: int = Field(ge=0)
    opcao: int = Field(default=0, ge=0)
    # indice do item -> indice da escolha; itens ausentes usam a primeira opcao
    escolhas: dict[int, int] = {}
