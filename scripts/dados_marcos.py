"""Fichas de treino e plano alimentar do Marcos, usados por importar_dados.py.

Macros por 100 g/ml: tabela TACO (UNICAMP); onde a TACO nao tem o alimento,
USDA ou rotulo do produto (marcados com comentario).
"""

# nome, kcal, proteina, carbo, gordura, porcao padrao, unidade, marca
ALIMENTOS = [
    # cafe / lanches
    ("Banana prata", 98, 1.3, 26.0, 0.1, 60, "g", None),
    ("Café sem açúcar", 9, 0.7, 1.5, 0.1, 120, "ml", None),
    ("Café com leite semidesnatado", 25, 1.8, 3.1, 0.6, 240, "ml", None),
    ("Pão francês sem miolo", 300, 8.0, 58.6, 3.1, 30, "g", None),
    ("Pão de forma integral", 253, 9.4, 49.9, 3.7, 50, "g", None),
    ("Ovo cozido", 146, 13.3, 0.6, 9.5, 100, "g", None),
    ("Requeijão light", 185, 10.5, 3.5, 14.0, 20, "g", None),  # rotulo medio
    ("Mussarela", 330, 22.6, 3.0, 25.2, 15, "g", None),
    ("Frango desfiado", 163, 31.5, 0.0, 3.2, 30, "g", None),
    ("Whey Protein Concentrado", 397, 73.3, 12.3, 6.0, 30, "g", "Growth 100% morango"),  # rotulo aprox.
    ("YoPRO / ItambéPRO / Piracanjuba PRO", 62, 10.0, 4.4, 0.6, 250, "g", None),  # rotulo aprox.
    ("Creatina monohidratada", 0, 0, 0, 0, 5, "g", None),
    # carboidratos do almoco/jantar
    ("Arroz branco cozido", 128, 2.5, 28.1, 0.2, 100, "g", None),
    ("Mandioca cozida", 125, 0.6, 30.1, 0.3, 100, "g", None),
    ("Macarrão integral cozido", 149, 6.0, 30.1, 1.7, 100, "g", None),  # USDA
    ("Inhame cozido", 97, 2.1, 23.2, 0.2, 100, "g", None),
    ("Purê de batata", 83, 2.0, 17.6, 0.6, 170, "g", None),  # USDA
    ("Batata inglesa assada", 93, 2.0, 21.6, 0.1, 170, "g", None),  # USDA
    ("Batata doce cozida", 77, 0.6, 18.4, 0.1, 130, "g", None),
    # leguminosas
    ("Feijão cozido", 76, 4.8, 13.6, 0.5, 80, "g", None),
    ("Ervilha cozida", 84, 5.4, 15.6, 0.2, 80, "g", None),  # USDA
    ("Lentilha cozida", 93, 6.3, 16.3, 0.5, 80, "g", None),
    ("Grão de bico cozido", 164, 8.9, 27.4, 2.6, 80, "g", None),  # USDA
    # proteinas
    ("Peito de frango cozido", 163, 31.5, 0.0, 3.2, 120, "g", None),
    ("Patinho cozido", 219, 35.9, 0.0, 7.3, 110, "g", None),
    ("Lombo suíno assado", 210, 35.7, 0.0, 6.4, 130, "g", None),
    ("Filé de peixe grelhado", 128, 26.2, 0.0, 2.7, 170, "g", None),  # USDA tilapia
    # frutas A
    ("Abacaxi", 48, 0.9, 12.3, 0.1, 150, "g", None),
    ("Damasco desidratado", 241, 3.4, 62.6, 0.5, 35, "g", None),  # USDA
    ("Caju", 43, 1.0, 10.3, 0.3, 160, "g", None),
    ("Carambola", 46, 0.9, 11.5, 0.2, 130, "g", None),
    ("Acerola", 33, 0.9, 8.0, 0.2, 60, "g", None),
    ("Goiaba", 54, 1.1, 13.0, 0.4, 300, "g", None),
    ("Laranja", 37, 1.0, 8.9, 0.1, 140, "g", None),
    ("Melancia", 33, 0.9, 8.1, 0.0, 200, "g", None),
    ("Melão", 29, 0.7, 7.5, 0.0, 150, "g", None),
    ("Morango", 30, 0.9, 6.8, 0.3, 100, "g", None),
    ("Pêssego", 36, 0.8, 9.3, 0.0, 220, "g", None),
    ("Tangerina", 38, 0.8, 9.6, 0.1, 150, "g", None),
    ("Kiwi", 51, 1.3, 11.5, 0.6, 150, "g", None),
    # frutas B
    ("Ameixa vermelha", 53, 0.8, 13.9, 0.0, 110, "g", None),
    ("Ameixa amarela", 43, 0.3, 11.5, 0.0, 90, "g", None),
    ("Maçã", 56, 0.3, 15.2, 0.0, 130, "g", None),
    ("Pera", 53, 0.6, 14.0, 0.1, 160, "g", None),
    ("Maracujá", 68, 2.0, 12.3, 2.1, 90, "g", None),
    ("Figo", 41, 1.0, 10.2, 0.2, 150, "g", None),
    ("Fruta do conde", 88, 1.5, 22.4, 0.3, 120, "g", None),
    ("Jabuticaba", 58, 0.6, 15.3, 0.1, 100, "g", None),
    ("Mamão", 40, 0.5, 10.4, 0.1, 150, "g", None),
    ("Manga", 51, 0.9, 12.8, 0.2, 200, "g", None),
    ("Caqui", 71, 0.4, 19.3, 0.1, 110, "g", None),
    ("Uva itálica", 53, 0.7, 13.6, 0.2, 100, "g", None),
    ("Uva passa", 299, 3.1, 79.2, 0.5, 15, "g", None),  # USDA
]


def _e(alimento, gramas=None, texto=None):
    return {"alimento": alimento, "gramas": gramas, "texto": texto}


def _vegetais(nomes):
    return [_e(n) for n in nomes]


GRUPOS = [
    {
        "nome": "Fruta A",
        "descricao": "Baixo índice glicêmico: abacaxi a acerola. Médio/alto: goiaba a kiwi.",
        "escolhas": [
            _e("Laranja", 140, "1 unidade média (com bagaço)"),
            _e("Abacaxi", 150, "2 fatias"),
            _e("Damasco desidratado", 35, "5 unidades"),
            _e("Caju", 160, "2 unidades"),
            _e("Carambola", 130, "1 unidade"),
            _e("Acerola", 60, "10 unidades"),
            _e("Goiaba", 300, "2 unidades"),
            _e("Melancia", 200, "1 fatia"),
            _e("Melão", 150, "1 fatia"),
            _e("Morango", 100, "8 unidades"),
            _e("Pêssego", 220, "2 unidades"),
            _e("Tangerina", 150, "1 unidade"),
            _e("Kiwi", 150, "2 unidades"),
        ],
    },
    {
        "nome": "Fruta B",
        "descricao": "Baixo índice glicêmico: ameixa a maracujá. Médio/alto: figo a uva passa.",
        "escolhas": [
            _e("Maçã", 130, "1 unidade pequena/média"),
            _e("Ameixa vermelha", 110, "2 unidades"),
            _e("Ameixa amarela", 90, "3 unidades"),
            _e("Pera", 160, "1 unidade"),
            _e("Maracujá", 90, "2 unidades"),
            _e("Figo", 150, "3 unidades"),
            _e("Fruta do conde", 120, "4 unidades"),
            _e("Jabuticaba", 100, "20 unidades"),
            _e("Mamão", 150, "metade"),
            _e("Manga", 200, "1 unidade média"),
            _e("Banana prata", 60, "1 unidade (prata ou maçã)"),
            _e("Caqui", 110, "1 unidade"),
            _e("Uva itálica", 100, "13 unidades"),
            _e("Uva passa", 15, "1 colher de sopa cheia"),
        ],
    },
    {
        "nome": "Vegetais A",
        "descricao": "À vontade.",
        "escolhas": _vegetais([
            "Brócolis", "Repolho", "Rabanete", "Couve-flor", "Espinafre", "Mostarda", "Agrião",
            "Almeirão", "Bertalha", "Rúcula", "Couve", "Serralha", "Berinjela", "Pimentão",
            "Cebola", "Alho", "Alface", "Abóbora verde com casca", "Tomate", "Palmito",
            "Acelga", "Pepino",
        ]),
    },
    {
        "nome": "Vegetais B",
        "descricao": "À vontade.",
        "escolhas": _vegetais([
            "Abóbora moranga", "Beterraba crua ou cozida", "Cenoura crua ou cozida", "Chuchu",
            "Nabo", "Vagem", "Quiabo",
        ]),
    },
]


def _prato(fator_carbo):
    """Almoco e jantar so mudam a porcao do carboidrato."""
    a, b, c = fator_carbo
    return [
        {
            "rotulo": "Carboidrato",
            "escolhas": [
                _e("Arroz branco cozido", a, f"{a} g"),
                _e("Mandioca cozida", a, f"{a} g"),
                _e("Macarrão integral cozido", a, f"{a} g"),
                _e("Inhame cozido", a, f"{a} g"),
                _e("Purê de batata", b, f"{b} g"),
                _e("Batata inglesa assada", b, f"{b} g"),
                _e("Batata doce cozida", c, f"{c} g"),
            ],
        },
        {
            "rotulo": "Leguminosa",
            "escolhas": [
                _e("Feijão cozido", 80, "1 concha média cheia"),
                _e("Ervilha cozida", 80, "1 concha média cheia"),
                _e("Lentilha cozida", 80, "1 concha média cheia"),
                _e("Grão de bico cozido", 80, "1 concha média cheia"),
            ],
        },
        {
            "rotulo": "Proteína",
            "escolhas": [
                _e("Peito de frango cozido", 120, "120 g"),
                _e("Patinho cozido", 110, "110 g"),
                _e("Lombo suíno assado", 130, "130 g"),
                _e("Filé de peixe grelhado", 170, "170 g"),
            ],
        },
        {
            "rotulo": "Vegetais A e B",
            "texto": "À vontade. Pode temperar com vinagre e limão.",
            "escolhas": [],
        },
    ]


REFEICOES = [
    {
        "horario": "06:00",
        "nome": "Pré-treino",
        "refeicao": "lanche",
        "obs": "30 a 60 minutos antes do treino.",
        "opcoes": [
            {"nome": "Plano", "itens": [
                {"rotulo": "Fruta", "escolhas": [_e("Banana prata", 60, "1 unidade")]},
            ]},
        ],
    },
    {
        "horario": "09:30",
        "nome": "Café da manhã",
        "refeicao": "cafe",
        "opcoes": [
            {"nome": "Plano", "itens": [
                {"rotulo": "Bebida", "escolhas": [_e("Café sem açúcar", 120, "meia xícara (120 ml)")]},
                {"rotulo": "Pão", "escolhas": [
                    _e("Pão francês sem miolo", 30, "1 unidade"),
                    _e("Pão de forma integral", 50, "2 fatias"),
                ]},
                {"rotulo": "Ovos", "escolhas": [_e("Ovo cozido", 100, "2 unidades")]},
                {"rotulo": "Acompanhamento", "escolhas": [
                    _e("Requeijão light", 20, "1 colher de sopa cheia (20 g)"),
                    _e("Mussarela", 15, "1 fatia fina (15 g)"),
                ]},
            ]},
            {"nome": "Substituição 1", "itens": [
                {"rotulo": "Bebida", "escolhas": [
                    _e("Café com leite semidesnatado", 240, "1 xícara cheia (240 ml)"),
                ]},
                {"rotulo": "Pão", "escolhas": [_e("Pão francês sem miolo", 30, "1 unidade")]},
                {"rotulo": "Recheio", "escolhas": [_e("Frango desfiado", 30, "30 g")]},
                {"rotulo": "Acompanhamento", "escolhas": [
                    _e("Requeijão light", 30, "1 colher de sopa (30 g)"),
                ]},
            ]},
        ],
    },
    {
        "horario": "12:10",
        "nome": "Almoço",
        "refeicao": "almoco",
        "opcoes": [
            {"nome": "Plano", "itens": _prato((100, 170, 130)) + [
                {"rotulo": "Fruta", "grupo": "Fruta A",
                 "texto": "Laranja com bagaço ou 1 porção de Fruta A."},
            ]},
        ],
    },
    {
        "horario": "16:00",
        "nome": "Lanche",
        "refeicao": "cafe_tarde",
        "opcoes": [
            {"nome": "Plano", "itens": [
                {"rotulo": "Shake", "texto": "Batido com 200 ml de água.", "agua_ml": 200,
                 "escolhas": [_e("Whey Protein Concentrado", 30, "30 g (3 scoops)")]},
                {"rotulo": "Fruta", "grupo": "Fruta B", "texto": "1 porção de Fruta B."},
            ]},
            {"nome": "Substituição 1", "itens": [
                {"rotulo": "Iogurte proteico", "escolhas": [
                    _e("YoPRO / ItambéPRO / Piracanjuba PRO", 250, "1 unidade (250 g)"),
                ]},
                {"rotulo": "Fruta", "grupo": "Fruta B", "texto": "1 porção de Fruta B."},
            ]},
        ],
    },
    {
        "horario": "20:00",
        "nome": "Jantar",
        "refeicao": "jantar",
        "opcoes": [
            {"nome": "Plano", "itens": _prato((50, 90, 80)) + [
                {"rotulo": "Suplemento", "escolhas": [_e("Creatina monohidratada", 5, "5 g")]},
            ]},
        ],
    },
]

PLANO = {"refeicoes": REFEICOES, "grupos": GRUPOS}

# Fichas desde 26/10/2026. Sexta (A) e sabado (C) viraram o padrao de A e C.
# (nome, foco, exercicios: (nome, grupo muscular, series, repeticoes, descanso_seg))
_PESADO, _LEVE = 120, 60  # 2 min nos compostos de 6-10 reps, 1 min nos demais
FICHAS = [
    ("Treino A", "Costas e Tríceps", [
        ("Puxada frontal", "Costas", 4, "6-8", _PESADO),
        ("Remada curvada com barra (ou remada baixa)", "Costas", 4, "8-10", _PESADO),
        ("Remada unilateral com halter", "Costas", 3, "10-12", _PESADO),
        ("Pulldown com braço reto na polia", "Costas", 3, "12", _LEVE),
        ("Tríceps na polia com corda", "Tríceps", 3, "10-12", _LEVE),
        ("Tríceps francês com corda", "Tríceps", 3, "10-12", _LEVE),
        ("Rosca de punho inversa", "Antebraço", 3, "15-20", _LEVE),
    ]),
    ("Treino B", "Quadríceps, Ombro e Antebraço", [
        ("Agachamento livre (ou hack/smith)", "Quadríceps", 3, "8-10", _PESADO),
        ("Leg press 45°", "Quadríceps", 3, "10-12", _LEVE),
        ("Cadeira extensora", "Quadríceps", 3, "12-15", _LEVE),
        ("Cadeira flexora", "Posterior de coxa", 3, "12-15", _LEVE),
        ("Desenvolvimento com halteres", "Ombros", 3, "8-10", _PESADO),
        ("Elevação lateral", "Ombros", 3, "12-15", _LEVE),
        ("Panturrilha sentado", "Panturrilha", 3, "15", _LEVE),
        ("Rosca de punho com barra", "Antebraço", 3, "15-20", _LEVE),
    ]),
    ("Treino C", "Peito, Bíceps e Antebraço", [
        ("Supino reto com barra", "Peito", 4, "6-8", _PESADO),
        ("Supino inclinado com halteres", "Peito", 3, "8-10", _PESADO),
        ("Crucifixo ou peck deck", "Peito", 3, "12", _LEVE),
        ("Rosca direta com barra", "Bíceps", 3, "8-10", _LEVE),
        ("Rosca Scott", "Bíceps", 3, "10-12", _LEVE),
        ("Rosca martelo", "Bíceps", 3, "10-12", _LEVE),
        ("Elevação lateral", "Ombros", 3, "12-15", _LEVE),
        ("Rosca inversa com barra", "Antebraço", 3, "10-12", _LEVE),
    ]),
    ("Treino D", "Posterior", [
        ("Hiperextensão 45°", "Lombar e glúteos", 4, "10-12", _LEVE),
        ("Máquina de glúteo ou ponte de glúteo", "Glúteos", 3, "10-12", _LEVE),
        ("Mesa flexora", "Posterior de coxa", 3, "10-12", _LEVE),
        ("Cadeira flexora", "Posterior de coxa", 3, "12", _LEVE),
        ("Panturrilha em pé", "Panturrilha", 4, "12-15", _LEVE),
    ]),
]
FICHA_OBS = {
    "Treino A": "Segunda e sexta.",
    "Treino B": "Terça.",
    "Treino C": "Quarta e sábado.",
    "Treino D": "Quinta.",
}
