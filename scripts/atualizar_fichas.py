"""Troca as fichas de treino da conta pelas de dados_marcos.FICHAS.

Uso:
    python scripts/atualizar_fichas.py [URL]   (padrao: https://evolucao-fit-lime.vercel.app)

Fichas antigas com o mesmo nome de uma nova (ex.: "Treino A" de foco diferente)
viram "Treino A (antiga)" e ficam inativas, para o historico manter o nome.
Pode rodar de novo: fichas novas que ja existem nao sao recriadas.
"""
import getpass
import sys

from dados_marcos import FICHA_OBS, FICHAS
from importar_dados import URL_PADRAO, Api

CAMPOS_EXERCICIO = ("nome", "grupo_muscular", "series", "repeticoes", "carga_kg", "descanso_seg", "observacoes")


def main():
    api = Api(sys.argv[1] if len(sys.argv) > 1 else URL_PADRAO)
    email = input("E-mail da conta: ").strip()
    senha = getpass.getpass("Senha (não aparece ao digitar): ")
    api.token = api.pedir("POST", "/auth/login", {"email": email, "senha": senha})["token"]

    novas = {nome: foco for nome, foco, _ in FICHAS}
    atuais = api.pedir("GET", "/fichas")

    for ficha in atuais:
        foco_novo = novas.get(ficha["nome"])
        if foco_novo is None or ficha["foco"] == foco_novo:
            continue
        api.pedir("PUT", f"/fichas/{ficha['id']}", {
            "nome": f"{ficha['nome']} (antiga)",
            "foco": ficha["foco"],
            "observacoes": ficha["observacoes"],
            "ativa": False,
            "exercicios": [{c: ex[c] for c in CAMPOS_EXERCICIO} for ex in ficha["exercicios"]],
        })
        print(f"Ficha '{ficha['nome']}' ({ficha['foco']}) arquivada como '{ficha['nome']} (antiga)'.")

    ja_existem = {(f["nome"], f["foco"]) for f in atuais}
    for nome, foco, exercicios in FICHAS:
        if (nome, foco) in ja_existem:
            print(f"Ficha '{nome} – {foco}' já existe, mantida como está.")
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
        print(f"Ficha '{nome} – {foco}' criada com {len(exercicios)} exercícios.")


if __name__ == "__main__":
    main()
