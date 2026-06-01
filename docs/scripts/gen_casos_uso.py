"""Diagrama UML de Casos de Uso — Rede Solidária."""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from _common import *


def stickman(ax, cx, cy, label, color=None):
    color = color or PALETTE["primary"]
    ax.add_patch(Circle((cx, cy + 4.2), 0.85,
                        fill=False, edgecolor=color, lw=1.6))
    ax.plot([cx, cx], [cy + 3.3, cy + 1.2], color=color, lw=1.6)
    ax.plot([cx - 1.3, cx + 1.3], [cy + 2.5, cy + 2.5], color=color, lw=1.6)
    ax.plot([cx, cx - 1.0], [cy + 1.2, cy - 0.4], color=color, lw=1.6)
    ax.plot([cx, cx + 1.0], [cy + 1.2, cy - 0.4], color=color, lw=1.6)
    ax.text(cx, cy - 1.6, label, fontsize=9.5, ha="center", va="center",
            fontweight="bold", color=color)


def use_case(ax, cx, cy, label, fontsize=7.5, w=11, h=3.4,
             face=None, edge=None):
    ax.add_patch(Ellipse((cx, cy), w, h, fill=True,
                         facecolor=face or PALETTE["primary_light"],
                         edgecolor=edge or PALETTE["primary"], lw=1.2))
    ax.text(cx, cy, label, fontsize=fontsize, ha="center",
            va="center", color=PALETTE["text"])


def line(ax, x1, y1, x2, y2, color=None, lw=0.9, ls="-"):
    color = color or PALETTE["primary"]
    ax.plot([x1, x2], [y1, y2], color=color, lw=lw, ls=ls)


def dashed(ax, x1, y1, x2, y2, lbl):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2),
                                  arrowstyle="-|>", mutation_scale=9,
                                  color=PALETTE["neutral"], lw=0.8,
                                  ls=(0, (3, 2))))
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    ax.text(mx, my, lbl, fontsize=6.0, ha="center", va="center",
            color=PALETTE["neutral"], style="italic",
            bbox=dict(facecolor="white", edgecolor="none", pad=0.5))


def gen():
    fig, ax = new_figure("A3", "UC",
                         "Diagrama de Casos de Uso — Rede Solidária",
                         "UC-01")

    # Caixa do sistema
    sys_x, sys_y, sys_w, sys_h = 23, 9, 54, 53
    ax.add_patch(Rectangle((sys_x, sys_y), sys_w, sys_h, fill=False,
                           edgecolor=PALETTE["primary"], lw=1.6))
    ax.text(sys_x + sys_w / 2, sys_y + sys_h - 0.9,
            "Sistema Rede Solidária", fontsize=10.5,
            ha="center", va="center", fontweight="bold",
            color=PALETTE["primary"],
            bbox=dict(facecolor="white", edgecolor="none", pad=0.6))

    # ===== Atores =====
    stickman(ax, 9, 50, "Doador")
    stickman(ax, 9, 36, "Recebedor")
    stickman(ax, 9, 22, "Voluntário")
    stickman(ax, 91, 36, "Administrador", color=PALETTE["danger"])

    # ===== Casos de uso compartilhados (coluna esquerda) =====
    # UC comuns
    uc_cad   = (33, 55); use_case(ax, *uc_cad, "Cadastrar-se")
    uc_auth  = (33, 50); use_case(ax, *uc_auth, "Autenticar (login)")
    uc_logout= (33, 45); use_case(ax, *uc_logout, "Logout / Refresh")

    # UC do doador
    uc_pub   = (45, 39); use_case(ax, *uc_pub, "Publicar doação", w=12)
    uc_upimg = (45, 34); use_case(ax, *uc_upimg, "Anexar fotos", w=11)
    uc_canc  = (45, 29); use_case(ax, *uc_canc, "Cancelar doação", w=12)

    # UC do recebedor
    uc_busc  = (33, 39); use_case(ax, *uc_busc, "Buscar doações", w=12)
    uc_res   = (33, 34); use_case(ax, *uc_res, "Reservar doação", w=12)

    # UC do voluntário
    uc_acc   = (33, 24); use_case(ax, *uc_acc, "Aceitar entrega", w=12)
    uc_status= (33, 19); use_case(ax, *uc_status, "Atualizar status\nda entrega", w=13, h=4)
    uc_review= (45, 22); use_case(ax, *uc_review, "Avaliar transação", w=13)

    # ===== Casos de uso de administração (coluna direita) =====
    uc_apr  = (66, 55); use_case(ax, *uc_apr, "Aprovar/Bloquear\nusuário", w=14, h=4,
                                  face=PALETTE["warn_light"], edge=PALETTE["warn"])
    uc_cat  = (66, 49); use_case(ax, *uc_cat, "Gerenciar\ncategorias", w=13, h=4,
                                  face=PALETTE["warn_light"], edge=PALETTE["warn"])
    uc_dash = (66, 43); use_case(ax, *uc_dash, "Dashboard\n+ métricas", w=13, h=4,
                                  face=PALETTE["warn_light"], edge=PALETTE["warn"])
    uc_csv  = (66, 37); use_case(ax, *uc_csv, "Exportar\nrelatórios (CSV)", w=14, h=4,
                                  face=PALETTE["warn_light"], edge=PALETTE["warn"])
    uc_logs = (66, 31); use_case(ax, *uc_logs, "Consultar logs\nde auditoria", w=14, h=4,
                                  face=PALETTE["warn_light"], edge=PALETTE["warn"])
    uc_mod  = (66, 25); use_case(ax, *uc_mod, "Moderar doações", w=14,
                                  face=PALETTE["warn_light"], edge=PALETTE["warn"])

    # ===== Associações ator/UC =====
    # Doador -> auth, cadastrar, publicar, anexar, cancelar, avaliar
    for u in [uc_cad, uc_auth, uc_logout, uc_pub, uc_canc, uc_review]:
        line(ax, 11.5, 50, u[0] - 5.5, u[1])
    # Recebedor -> auth, cadastrar, buscar, reservar, avaliar
    for u in [uc_cad, uc_auth, uc_busc, uc_res, uc_review]:
        line(ax, 11.5, 36, u[0] - 5.5, u[1])
    # Voluntário -> auth, cadastrar, aceitar, status, avaliar
    for u in [uc_cad, uc_auth, uc_acc, uc_status, uc_review]:
        line(ax, 11.5, 22, u[0] - 5.5, u[1])
    # Admin -> auth + todos UC admin
    for u in [uc_auth, uc_apr, uc_cat, uc_dash, uc_csv, uc_logs, uc_mod]:
        line(ax, 88.5, 36, u[0] + 6, u[1], color=PALETTE["danger"])

    # ===== <<include>> / <<extend>> =====
    # Publicar inclui anexar fotos
    dashed(ax, 45, 37.3, 45, 35.7, "«include»")
    # Aceitar entrega estende-se de reservar
    dashed(ax, 33, 32.0, 33, 26, "«extend»")
    # Atualizar status faz parte de aceitar entrega
    dashed(ax, 33, 22, 33, 21, "«include»")

    # ===== Legenda =====
    lx, ly = 23, 5
    ax.add_patch(Rectangle((lx - 21, ly), 20, 3.5, fill=True,
                           facecolor="white",
                           edgecolor=PALETTE["primary"], lw=0.6))
    ax.text(lx - 19, ly + 2.5, "Legenda",
            fontsize=7.5, fontweight="bold",
            color=PALETTE["primary"])
    ax.text(lx - 19, ly + 1.4, "—  associação ator–UC",
            fontsize=6.4, color=PALETTE["text"])
    ax.text(lx - 19, ly + 0.5, "···▷  «include» / «extend»",
            fontsize=6.4, color=PALETTE["neutral"])
    ax.add_patch(Ellipse((lx - 5, ly + 1.4), 2.5, 1.2, fill=True,
                         facecolor=PALETTE["primary_light"],
                         edgecolor=PALETTE["primary"], lw=0.6))
    ax.text(lx - 1.5, ly + 1.4, "UC comum", fontsize=6.2,
            va="center", color=PALETTE["text"])
    ax.add_patch(Ellipse((lx - 5, ly + 0.4), 2.5, 1.2, fill=True,
                         facecolor=PALETTE["warn_light"],
                         edgecolor=PALETTE["warn"], lw=0.6))
    ax.text(lx - 1.5, ly + 0.4, "UC admin", fontsize=6.2,
            va="center", color=PALETTE["text"])

    save_pdf_and_png(fig, "CasosDeUso")


if __name__ == "__main__":
    print("Gerando Casos de Uso...")
    gen()
