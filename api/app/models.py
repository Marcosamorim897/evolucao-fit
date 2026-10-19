from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(180), unique=True, nullable=False, index=True)
    senha_hash: Mapped[str] = mapped_column(String(200), nullable=False)
    meta_agua_ml: Mapped[int] = mapped_column(Integer, default=3000, nullable=False)
    meta_calorias: Mapped[int] = mapped_column(Integer, default=2200, nullable=False)
    meta_proteina_g: Mapped[int] = mapped_column(Integer, default=140, nullable=False)
    altura_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    fichas: Mapped[list["Ficha"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")


class Ficha(Base):
    """Ficha de treino (ex.: Treino A - Peito e triceps)."""

    __tablename__ = "fichas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    foco: Mapped[str | None] = mapped_column(String(120), nullable=True)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    ativa: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    ordem: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    usuario: Mapped[Usuario] = relationship(back_populates="fichas")
    exercicios: Mapped[list["Exercicio"]] = relationship(
        back_populates="ficha",
        cascade="all, delete-orphan",
        order_by="Exercicio.ordem",
    )


class Exercicio(Base):
    __tablename__ = "exercicios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ficha_id: Mapped[int] = mapped_column(ForeignKey("fichas.id", ondelete="CASCADE"), index=True)
    nome: Mapped[str] = mapped_column(String(140), nullable=False)
    grupo_muscular: Mapped[str | None] = mapped_column(String(60), nullable=True)
    series: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    repeticoes: Mapped[str] = mapped_column(String(40), default="10", nullable=False)
    carga_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    descanso_seg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    ordem: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    ficha: Mapped[Ficha] = relationship(back_populates="exercicios")


class Treino(Base):
    """Sessao de treino realizada em um dia."""

    __tablename__ = "treinos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    data: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    ficha_id: Mapped[int | None] = mapped_column(ForeignKey("fichas.id", ondelete="SET NULL"), nullable=True)
    titulo: Mapped[str | None] = mapped_column(String(140), nullable=True)
    duracao_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notas: Mapped[str | None] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    ficha: Mapped[Ficha | None] = relationship()
    series: Mapped[list["SerieRealizada"]] = relationship(
        back_populates="treino", cascade="all, delete-orphan"
    )


class SerieRealizada(Base):
    """Carga/repeticoes efetivamente feitas em um exercicio naquele treino."""

    __tablename__ = "series_realizadas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    treino_id: Mapped[int] = mapped_column(ForeignKey("treinos.id", ondelete="CASCADE"), index=True)
    exercicio_id: Mapped[int | None] = mapped_column(
        ForeignKey("exercicios.id", ondelete="SET NULL"), nullable=True
    )
    nome_exercicio: Mapped[str] = mapped_column(String(140), nullable=False)
    series: Mapped[int | None] = mapped_column(Integer, nullable=True)
    repeticoes: Mapped[str | None] = mapped_column(String(40), nullable=True)
    carga_kg: Mapped[float | None] = mapped_column(Float, nullable=True)

    treino: Mapped[Treino] = relationship(back_populates="series")


class Medida(Base):
    __tablename__ = "medidas"
    __table_args__ = (UniqueConstraint("usuario_id", "data", name="uq_medida_usuario_data"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    data: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    peso_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    gordura_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    pescoco_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    ombro_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    peito_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    cintura_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    abdomen_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    quadril_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    braco_d_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    braco_e_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    antebraco_d_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    antebraco_e_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    coxa_d_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    coxa_e_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    panturrilha_d_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    panturrilha_e_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)


class Alimento(Base):
    """Alimento salvo pelo usuario, com valores por 100 g (ou por 100 ml)."""

    __tablename__ = "alimentos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    nome: Mapped[str] = mapped_column(String(140), nullable=False)
    marca: Mapped[str | None] = mapped_column(String(80), nullable=True)
    kcal_100: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    proteina_100: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    carbo_100: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    gordura_100: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    porcao_padrao_g: Mapped[float] = mapped_column(Float, default=100, nullable=False)
    unidade: Mapped[str] = mapped_column(String(10), default="g", nullable=False)


class ItemRefeicao(Base):
    __tablename__ = "itens_refeicao"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    data: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    refeicao: Mapped[str] = mapped_column(String(20), default="almoco", nullable=False)
    alimento_id: Mapped[int | None] = mapped_column(
        ForeignKey("alimentos.id", ondelete="SET NULL"), nullable=True
    )
    descricao: Mapped[str] = mapped_column(String(160), nullable=False)
    quantidade: Mapped[float] = mapped_column(Float, default=100, nullable=False)
    kcal: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    proteina_g: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    carbo_g: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    gordura_g: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)


class RegistroAgua(Base):
    __tablename__ = "registros_agua"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    data: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    ml: Mapped[int] = mapped_column(Integer, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)


class PlanoAlimentar(Base):
    """Dieta passada pela nutricionista: refeicoes, opcoes e grupos de substituicao (JSON)."""

    __tablename__ = "planos_alimentares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, index=True
    )
    conteudo: Mapped[str] = mapped_column(Text, nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
