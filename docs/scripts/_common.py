"""Utilitários compartilhados pelos scripts de geração de diagramas."""

from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle, Circle, Polygon, Ellipse
from matplotlib.lines import Line2D
import os

ROOT = "/Users/jhonatanrabelo/Documents/Fatec/Eng 3/Projeto/RedeSolid-ria"
OUTDIR = os.path.join(ROOT, "docs", "diagramas")

PAGE_W_A3, PAGE_H_A3 = 16.5, 11.7  # A3 paisagem
PAGE_W_A4, PAGE_H_A4 = 11.7, 8.27  # A4 paisagem

PALETTE = {
    "primary": "#1f3a5f",
    "primary_light": "#E8F1F7",
    "accent": "#10b981",
    "accent_light": "#d1fae5",
    "warn": "#b45309",
    "warn_light": "#fef3c7",
    "danger": "#b91c1c",
    "neutral": "#475569",
    "neutral_light": "#f1f5f9",
    "muted": "#94a3b8",
    "text": "#0f172a",
}


def new_figure(orientation="A3", title_node="", title_name="", page_num=""):
    if orientation == "A3":
        w, h = PAGE_W_A3, PAGE_H_A3
    else:
        w, h = PAGE_W_A4, PAGE_H_A4
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 70)
    ax.set_aspect("equal")
    ax.axis("off")
    # Cabeçalho
    ax.add_patch(Rectangle((1, 65), 98, 4, fill=True,
                           facecolor=PALETTE["primary"],
                           edgecolor="black", lw=1.2))
    ax.text(50, 67, f"{title_name}",
            fontsize=13, fontweight="bold", color="white",
            ha="center", va="center")
    # Moldura
    ax.add_patch(Rectangle((1, 1), 98, 68, fill=False,
                           edgecolor="black", lw=1.2))
    # Rodapé / cartouche
    ax.add_patch(Rectangle((1, 1), 98, 5, fill=True,
                           facecolor="#f0f3f7", edgecolor="black", lw=1.2))
    ax.plot([35, 35], [1, 6], color="black", lw=1.0)
    ax.plot([80, 80], [1, 6], color="black", lw=1.0)
    ax.text(2, 3.5,
            "PROJETO: Rede Solidária — Gerenciador de Doações\n"
            "EQUIPE: Jhonatan Rabelo · Vitor Campos · Ana Toledo · Edilson Junior",
            fontsize=8, va="center")
    ax.text(36, 3.5, f"NÓ: {title_node}\nTÍTULO: {title_name}",
            fontsize=8, va="center", fontweight="bold")
    ax.text(81, 3.5, f"PÁGINA: {page_num}\nDISCIPLINA: Eng. SW III",
            fontsize=8, va="center")
    return fig, ax


def box(ax, x, y, w, h, text, sub=None, num=None,
        face=PALETTE["primary_light"], edge=PALETTE["primary"],
        text_color=None, fontsize=11):
    ax.add_patch(FancyBboxPatch((x, y), w, h,
                                 boxstyle="round,pad=0.02,rounding_size=0.6",
                                 facecolor=face, edgecolor=edge, lw=1.6))
    ax.text(x + w / 2, y + h / 2 + (1 if sub else 0), text,
            fontsize=fontsize, fontweight="bold",
            ha="center", va="center",
            color=text_color or edge)
    if sub:
        ax.text(x + w / 2, y + h / 2 - 1.3, sub,
                fontsize=fontsize - 3.5, ha="center", va="center",
                color="#3a3a3a", style="italic")
    if num:
        ax.text(x + w - 1.2, y + 0.8, num, fontsize=9,
                ha="right", va="bottom", color=edge, fontweight="bold")


def arrow(ax, x1, y1, x2, y2, color=None, lw=1.4, ls="-"):
    color = color or PALETTE["primary"]
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2),
                                  arrowstyle="-|>", mutation_scale=14,
                                  color=color, lw=lw, ls=ls,
                                  shrinkA=0, shrinkB=0))


def curved_arrow(ax, x1, y1, x2, y2, color=None, lw=1.2, rad=0.2, ls="-"):
    color = color or PALETTE["primary"]
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2),
                                  arrowstyle="-|>", mutation_scale=12,
                                  color=color, lw=lw, ls=ls,
                                  connectionstyle=f"arc3,rad={rad}"))


def text(ax, x, y, text_, size=8, color=None, anchor="center",
         bold=True, italic=False):
    ha = {"center": "center", "left": "left", "right": "right"}[anchor]
    style = "italic" if italic else "normal"
    weight = "bold" if bold else "normal"
    ax.text(x, y, text_, fontsize=size, ha=ha, va="center",
            color=color or PALETTE["text"],
            fontweight=weight, style=style)


def save_pdf_and_png(fig, basename):
    pdf_path = os.path.join(OUTDIR, f"{basename}.pdf")
    png_path = os.path.join(OUTDIR, f"{basename}.png")
    fig.savefig(pdf_path, bbox_inches="tight")
    fig.savefig(png_path, bbox_inches="tight", dpi=220)
    plt.close(fig)
    print(f"  -> {basename}.pdf / .png")
