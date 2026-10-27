"""Cadastra fichas, alimentos e plano alimentar numa conta do EvolucaoFit pela API.

Uso:
    python scripts/importar_dados.py [URL]   (padrao: https://evolucao-fit-lime.vercel.app)

Pede e-mail e senha no terminal; a senha nao fica salva em lugar nenhum.
Pode rodar de novo: alimentos sao atualizados, fichas que ja existem com o
mesmo nome sao mantidas (recria-las apagaria o vinculo com as cargas registradas).
"""
import getpass
import json
import sys
import urllib.error
import urllib.request

from dados_marcos import ALIMENTOS, FICHA_OBS, FICHAS, PLANO

URL_PADRAO = "https://evolucao-fit-lime.vercel.app"


class Api:
    def __init__(self, base):
        self.base = base.rstrip("/") + "/api"
        self.token = None

    def pedir(self, metodo, caminho, corpo=None):
        dados = json.dumps(corpo).encode() if corpo is not None else None
        req = urllib.request.Request(self.base + caminho, data=dados, method=metodo)
        req.add_header("Content-Type", "application/json")
        if self.token:
            req.add_header("Authorization", f"Bearer {self.token}")
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                texto = resp.read().decode()
        except urllib.error.HTTPError as erro:
            sys.exit(f"Erro {erro.code} em {metodo} {caminho}: {erro.read().decode()}")
        return json.loads(texto) if texto else None


def metas_do_plano():
    """Soma a primeira opcao de cada refeicao (primeira escolha de cada item)."""
    por_nome = {a[0].lower(): a for a in ALIMENTOS}
    grupos = {g["nome"]: g["escolhas"] for g in PLANO["grupos"]}
    kcal = prot = 0.0
    for refeicao in PLANO["refeicoes"]:
        for item in refeicao["opcoes"][0]["itens"]:
            candidatos = item.get("escolhas") or grupos.get(item.get("grupo"), [])
            if not candidatos or candidatos[0]["gramas"] is None:
                continue
            escolha = candidatos[0]
            _, k, p, *_ = por_nome[escolha["alimento"].lower()]
            kcal += k * escolha["gramas"] / 100
            prot += p * escolha["gramas"] / 100
    return round(kcal / 10) * 10, round(prot)


def main():
    api = Api(sys.argv[1] if len(sys.argv) > 1 else URL_PADRAO)
    email = input("E-mail da conta: ").strip()
    senha = getpass.getpass("Senha (não aparece ao digitar): ")
    api.token = api.pedir("POST", "/auth/login", {"email": email, "senha": senha})["token"]

    existentes = {a["nome"].lower(): a["id"] for a in api.pedir("GET", "/alimentos")}
    novos = atualizados = 0
    for nome, kcal, p, c, g, porcao, unidade, marca in ALIMENTOS:
        corpo = {
            "nome": nome, "marca": marca, "kcal_100": kcal, "proteina_100": p,
            "carbo_100": c, "gordura_100": g, "porcao_padrao_g": porcao, "unidade": unidade,
        }
        if nome.lower() in existentes:
            api.pedir("PUT", f"/alimentos/{existentes[nome.lower()]}", corpo)
            atualizados += 1
        else:
            api.pedir("POST", "/alimentos", corpo)
            novos += 1
    print(f"Alimentos: {novos} novos, {atualizados} atualizados.")

    fichas_atuais = {f["nome"].lower() for f in api.pedir("GET", "/fichas")}
    for nome, foco, exercicios in FICHAS:
        if nome.lower() in fichas_atuais:
            print(f"Ficha '{nome}' já existe, mantida como está.")
            continue
        api.pedir("POST", "/fichas", {
            "nome": nome,
            "foco": foco,
            "observacoes": FICHA_OBS.get(nome),
            "exercicios": [
                {"nome": ex, "grupo_muscular": grupo, "series": series, "repeticoes": reps,
                 "descanso_seg": descanso}
                for ex, grupo, series, reps, descanso in exercicios
            ],
        })
        print(f"Ficha '{nome}' criada com {len(exercicios)} exercícios.")

    api.pedir("PUT", "/plano", PLANO)
    print(f"Plano alimentar salvo ({len(PLANO['refeicoes'])} refeições).")

    kcal, prot = metas_do_plano()
    api.pedir("PUT", "/auth/eu", {"meta_calorias": kcal, "meta_proteina_g": prot})
    print(f"Metas ajustadas pelo plano: {kcal} kcal e {prot} g de proteína por dia.")


if __name__ == "__main__":
    main()
