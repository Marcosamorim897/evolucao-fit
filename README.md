# EvoluçãoFit

App pessoal para acompanhar evolução na academia e no corpo: fichas de treino,
calendário de treinos, medidas corporais, alimentação e água.

- **Front-end:** React 18 + Vite (JavaScript, sem TypeScript), gráficos com Recharts, PWA simples.
- **Back-end:** FastAPI + SQLAlchemy rodando como **funções serverless Python da Vercel**.
- **Banco:** Postgres no [Neon](https://neon.tech) (em dev, cai automaticamente para SQLite local).
- **Login:** multiusuário, e-mail + senha (bcrypt) com token JWT de 30 dias.

## Estrutura

```
evolucao-fit/
├── api/
│   ├── index.py            # entrypoint da Vercel (expõe `app` ASGI)
│   └── app/
│       ├── main.py         # cria o FastAPI e registra os routers
│       ├── config.py       # variáveis de ambiente
│       ├── db.py           # engine/sessão (NullPool no Postgres)
│       ├── models.py       # tabelas SQLAlchemy
│       ├── schemas.py      # validação Pydantic
│       ├── security.py     # hash de senha e JWT
│       └── routers/        # auth, fichas, treinos, medidas, alimentacao, agua, resumo
├── src/                    # front-end React
│   ├── pages/              # Painel, Treinos, Fichas, Medidas, Dieta, Perfil, Login
│   ├── components/         # Layout, ícones e peças de interface
│   └── lib/                # cliente da API, contexto de login, formatação
├── scripts/init_db.py      # cria as tabelas no banco
├── vercel.json             # rotas /api/* → função Python; resto → SPA
└── requirements.txt        # dependências Python (lidas pela Vercel)
```

## Rodando localmente

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
npm install
.venv/bin/python scripts/init_db.py      # cria evolucao-fit.db (SQLite)
```

Em dois terminais:

```bash
npm run api     # API em http://127.0.0.1:8000 (docs em /api/docs)
npm run dev     # front em http://localhost:5173 (faz proxy de /api)
```

Sem `DATABASE_URL`, o app usa SQLite local — dá para desenvolver sem tocar no banco de produção.

## Deploy na Vercel + Neon

1. **Banco (Neon):** crie um projeto e copie a connection string do endpoint **`-pooler`**
   (serverless abre uma conexão por invocação; o pooler evita estourar o limite do Neon).
2. **Repositório:** suba este projeto para o GitHub.
3. **Vercel:** *Add New → Project* e importe o repositório. O framework é detectado como
   Vite; não é preciso mexer em build command nem output directory.
4. **Variáveis de ambiente** (Settings → Environment Variables):

   | Nome | Valor |
   |---|---|
   | `DATABASE_URL` | connection string do Neon (`...-pooler...?sslmode=require`) |
   | `JWT_SECRET` | `python3 -c "import secrets;print(secrets.token_hex(32))"` |
   | `CODIGO_CONVITE` | opcional: exige esse código para criar conta |

5. **Crie as tabelas** uma vez, da sua máquina, apontando para o Neon:

   ```bash
   DATABASE_URL="postgresql://...-pooler.../evolucaofit?sslmode=require" .venv/bin/python scripts/init_db.py
   ```

6. Deploy. O front sai em `https://<projeto>.vercel.app` e a API em `/api/*`.
   `GET /api/saude` responde `{"status":"ok"}` e serve de health check.

### Por que não precisa de ping (cron-job.org)

Diferente do Render free, as funções serverless da Vercel não hibernam: elas sobem
sob demanda. O Neon pode suspender o banco ocioso, mas religa na primeira query —
por isso o engine usa `NullPool` + `pool_pre_ping`, que evita o erro de conexão morta.

### Liberando para amigos testarem

Qualquer pessoa com o link pode criar conta, e cada conta só enxerga os próprios dados.
Para controlar quem entra, defina `CODIGO_CONVITE` na Vercel e passe o código junto com o link.

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| POST | `/api/auth/registrar` · `/api/auth/login` | cria conta / entra (devolve token) |
| GET/PUT | `/api/auth/eu` | dados e metas do usuário |
| GET/POST/PUT/DELETE | `/api/fichas` | fichas de treino com exercícios |
| GET/POST/PUT/DELETE | `/api/treinos` | sessões de treino |
| GET | `/api/treinos/calendario/{ano}/{mes}` | dias treinados do mês + sequência |
| GET | `/api/treinos/ultima-carga/{exercicio_id}` | última carga usada (pré-preenche o form) |
| GET/POST/DELETE | `/api/medidas` | medidas corporais (uma por data) |
| GET/POST/PUT/DELETE | `/api/alimentos` | biblioteca de alimentos (valores por 100 g) |
| GET/POST/DELETE | `/api/refeicoes` | diário de refeições do dia |
| GET/POST/DELETE | `/api/agua` | registros de água do dia |
| GET | `/api/resumo` | números do painel |

## Ideias para depois

- Gráfico de evolução de carga por exercício.
- Foto de progresso junto das medidas (precisa de storage, ex.: Vercel Blob).
- Exportar histórico em CSV.
- Busca de alimentos em base pública (Open Food Facts / TBCA).
