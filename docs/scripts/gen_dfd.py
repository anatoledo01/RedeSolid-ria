"""DFD (Diagrama de Fluxo de Dados) Nível 1 — notação Gane & Sarson."""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from _common import *


def external(ax, cx, cy, label, w=10, h=5):
    x, y = cx - w / 2, cy - h / 2
    ax.add_patch(Rectangle((x + 0.4, y - 0.4), w, h,
                           facecolor=PALETTE["muted"], alpha=0.4))
    ax.add_patch(Rectangle((x, y), w, h, fill=True,
                           facecolor="#fff9e6",
                           edgecolor=PALETTE["warn"], lw=1.6))
    ax.text(cx, cy, label, fontsize=9, ha="center", va="center",
            fontweight="bold", color=PALETTE["warn"])


def process(ax, cx, cy, label, num, w=14, h=8):
    x, y = cx - w / 2, cy - h / 2
    ax.add_patch(FancyBboxPatch((x, y), w, h,
                                 boxstyle="round,pad=0.02,rounding_size=0.8",
                                 facecolor=PALETTE["accent_light"],
                                 edgecolor=PALETTE["accent"], lw=1.6))
    # Faixa superior com número
    ax.add_patch(Rectangle((x, y + h - 1.6), w, 1.6,
                           facecolor=PALETTE["accent"],
                           edgecolor=PALETTE["accent"]))
    ax.text(cx, y + h - 0.8, num, fontsize=9, fontweight="bold",
            ha="center", va="center", color="white")
    ax.text(cx, y + (h - 1.6) / 2, label, fontsize=8.3,
            ha="center", va="center",
            color=PALETTE["text"], fontweight="bold")


def datastore(ax, cx, cy, label, num, w=15, h=3.6):
    x, y = cx - w / 2, cy - h / 2
    ax.add_patch(Rectangle((x, y), w, h, fill=True,
                           facecolor=PALETTE["primary_light"],
                           edgecolor=PALETTE["primary"], lw=1.4))
    ax.add_patch(Rectangle((x, y), 2.2, h,
                           facecolor=PALETTE["primary"],
                           edgecolor=PALETTE["primary"]))
    ax.text(x + 1.1, y + h / 2, num, fontsize=8,
            ha="center", va="center", color="white", fontweight="bold")
    ax.text(x + 2.2 + (w - 2.2) / 2, y + h / 2, label,
            fontsize=7.8, ha="center", va="center",
            color=PALETTE["primary"], fontweight="bold")


def flow(ax, x1, y1, x2, y2, lbl=None, color=None, curved=False, rad=0.15,
         lbl_offset=(0, 0.8), lbl_size=6.5):
    color = color or PALETTE["primary"]
    if curved:
        ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2),
                                      arrowstyle="-|>", mutation_scale=11,
                                      color=color, lw=1.0,
                                      connectionstyle=f"arc3,rad={rad}"))
    else:
        arrow(ax, x1, y1, x2, y2, color=color, lw=1.0)
    if lbl:
        mx = (x1 + x2) / 2 + lbl_offset[0]
        my = (y1 + y2) / 2 + lbl_offset[1]
        ax.text(mx, my, lbl, fontsize=lbl_size, ha="center", va="center",
                color=color, style="italic",
                bbox=dict(facecolor="white", edgecolor="none", pad=0.4))


def gen():
    fig, ax = new_figure("A3", "DFD-1", "DFD Nível 1 — Rede Solidária", "DFD-01")

    # ===== Entidades externas (extremidades) =====
    external(ax, 7, 56, "Doador")
    external(ax, 7, 40, "Recebedor")
    external(ax, 7, 24, "Voluntário")
    external(ax, 93, 50, "Administrador")

    # ===== Processos (zona central) =====
    process(ax, 28, 56, "Autenticar &\nGerenciar Usuários", "P1", w=15, h=8)
    process(ax, 28, 40, "Publicar &\nCadastrar Doação", "P2", w=15, h=8)
    process(ax, 28, 24, "Reservar &\nBuscar Doação", "P3", w=15, h=8)
    process(ax, 52, 32, "Coordenar\nEntrega", "P4", w=14, h=8)
    process(ax, 75, 24, "Avaliar\nTransação", "P5", w=14, h=8)
    process(ax, 75, 50, "Administrar\n& Auditar", "P6", w=14, h=8)

    # ===== Depósitos de dados (faixa inferior) =====
    datastore(ax, 14, 9, "Usuários", "D1")
    datastore(ax, 32, 9, "Doações + Categorias", "D2")
    datastore(ax, 51, 9, "Entregas + Endereços", "D3")
    datastore(ax, 70, 9, "Reviews", "D4")
    datastore(ax, 89, 9, "AuditLog", "D5")

    # ===== Fluxos externos (entrada) =====
    flow(ax, 12, 56, 20.5, 56, "credenciais")
    flow(ax, 12, 40, 20.5, 40, "itens p/ doar\n(fotos, descrição)", lbl_offset=(0, 1.4))
    flow(ax, 12, 38, 20.5, 38, "")  # 2ª seta menor
    flow(ax, 12, 40, 20.5, 56, "cadastro", curved=True, rad=-0.35,
         lbl_offset=(-2, 4))
    flow(ax, 12, 24, 20.5, 24, "necessidades")
    flow(ax, 12, 24, 20.5, 56, "cadastro", curved=True, rad=-0.4,
         lbl_offset=(0, 0))
    flow(ax, 88, 50, 82, 50, "ações admin")

    # ===== Fluxos entre processos =====
    flow(ax, 28, 52, 28, 44, "token JWT", lbl_offset=(2, 0))
    flow(ax, 28, 36, 28, 28, "doação\npublicada", lbl_offset=(2.5, 0))
    flow(ax, 35.5, 24, 45, 32, "doação\nreservada", lbl_offset=(1, 1.5))
    flow(ax, 58.5, 32, 68, 24, "entrega\nconcluída", lbl_offset=(0, 1.5))
    flow(ax, 75, 28, 75, 46, "transação\nfinalizada", lbl_offset=(2.5, 0))

    # ===== Fluxos com depósitos =====
    # P1 ↔ D1
    flow(ax, 24, 52, 16, 11, "novo usuário", curved=True, rad=0.2,
         lbl_offset=(-3, 4))
    flow(ax, 12, 11, 22, 52, "dados\nusuário", curved=True, rad=0.2,
         lbl_offset=(-4, 0))
    # P2 ↔ D2
    flow(ax, 28, 36, 32, 11, "nova\ndoação", lbl_offset=(1.5, 0))
    flow(ax, 34, 11, 30, 36, "catálogo", curved=True, rad=0.1,
         lbl_offset=(1, 4))
    # P3 ↔ D2 (reservar)
    flow(ax, 32, 20, 34, 11, "reserva", lbl_offset=(1.5, 0))
    # P4 ↔ D3
    flow(ax, 52, 28, 51, 11, "nova entrega", lbl_offset=(2.5, 0))
    flow(ax, 53, 11, 52, 28, "histórico\nrotas", lbl_offset=(-2.5, 4))
    # P5 ↔ D4
    flow(ax, 75, 20, 70, 11, "review", lbl_offset=(1.5, 0))
    flow(ax, 72, 11, 76, 20, "histórico", lbl_offset=(2, 2))
    # P6 ↔ D5
    flow(ax, 75, 46, 89, 11, "evento", curved=True, rad=-0.2,
         lbl_offset=(2, 2))
    flow(ax, 87, 11, 73, 46, "logs", curved=True, rad=0.2,
         lbl_offset=(-3, 0))
    # P6 lê D1..D4 para relatórios (linha pontilhada agregada)
    ax.add_patch(FancyArrowPatch((75, 46), (51, 10.8),
                                  arrowstyle="-|>", mutation_scale=10,
                                  color=PALETTE["neutral"], lw=0.9,
                                  ls=(0, (4, 3)),
                                  connectionstyle="arc3,rad=-0.35"))
    ax.text(64, 30, "agregações\np/ dashboard", fontsize=6.4,
            ha="center", va="center",
            color=PALETTE["neutral"], style="italic",
            bbox=dict(facecolor="white", edgecolor="none", pad=0.4))

    # ===== Saída para Administrador =====
    flow(ax, 82, 53, 88, 53, "dashboard\n+ CSV", color=PALETTE["danger"],
         lbl_offset=(0, 1.2))

    # ===== Legenda =====
    lx, ly = 2, 64
    ax.add_patch(Rectangle((lx, ly), 20, 0.0, fill=False))  # placeholder
    ly = 11
    ax.add_patch(Rectangle((lx, ly), 8, 4, fill=True,
                           facecolor="white",
                           edgecolor=PALETTE["primary"], lw=0.6))
    ax.text(lx + 4, ly + 3.2, "Legenda — DFD",
            fontsize=6.8, fontweight="bold", ha="center",
            color=PALETTE["primary"])
    # mini símbolos: entidade externa, processo, depósito
    ax.add_patch(Rectangle((lx + 0.4, ly + 1.6), 1.2, 0.8,
                           facecolor="#fff9e6",
                           edgecolor=PALETTE["warn"], lw=0.6))
    ax.text(lx + 2.0, ly + 2.0, "entidade externa",
            fontsize=5.6, va="center")
    ax.add_patch(FancyBboxPatch((lx + 0.4, ly + 0.4), 1.2, 0.8,
                                 boxstyle="round,pad=0.02,rounding_size=0.2",
                                 facecolor=PALETTE["accent_light"],
                                 edgecolor=PALETTE["accent"], lw=0.6))
    ax.text(lx + 2.0, ly + 0.8, "processo (Pn)",
            fontsize=5.6, va="center")

    save_pdf_and_png(fig, "DFD")


if __name__ == "__main__":
    print("Gerando DFD...")
    gen()
