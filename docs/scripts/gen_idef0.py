"""Gera IDEF0 N0 (contexto) e N1 (decomposição) em PDF e PNG."""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from _common import *


def gen_n0():
    fig, ax = new_figure("A3", "A-0",
                         "IDEF0 N0 — Gerenciar Plataforma Rede Solidária",
                         "N0")

    bx, by, bw, bh = 38, 28, 24, 12
    box(ax, bx, by, bw, bh,
        "Gerenciar Plataforma\nRede Solidária",
        sub="(escopo completo do sistema)",
        num="A0")

    # Entradas (esquerda)
    inputs = [
        "Itens disponíveis para doação",
        "Necessidades de recebedores",
        "Disponibilidade de voluntários",
        "Dados de cadastro e perfil",
    ]
    for i, t in enumerate(inputs):
        y = by + bh - 2 - i * 2.6
        arrow(ax, 12, y, bx, y)
        text(ax, 11.5, y, t, anchor="right")
    text(ax, 6, by + bh + 1.5, "ENTRADAS",
         color=PALETTE["accent"], size=10)

    # Controles (topo)
    ctrls = [
        ("LGPD /\nPrivacidade", bx + 3),
        ("Regras de\nnegócio\n(status, papéis)", bx + 9),
        ("Política de\naprovação\n(admin)", bx + 15),
        ("Termos de uso\n& moderação", bx + 21),
    ]
    for t, cx in ctrls:
        arrow(ax, cx, 58, cx, by + bh)
        ax.text(cx, 60.5, t, fontsize=7.5, ha="center", va="bottom",
                color=PALETTE["warn"], fontweight="bold")
    text(ax, 50, 64, "CONTROLES", color=PALETTE["warn"], size=10)

    # Saídas (direita)
    outputs = [
        "Doações entregues a recebedores",
        "Avaliações e reputação",
        "Relatórios gerenciais (CSV)",
        "Logs de auditoria",
        "Métricas de impacto social",
    ]
    for i, t in enumerate(outputs):
        y = by + bh - 1.5 - i * 2.4
        arrow(ax, bx + bw, y, 88, y)
        text(ax, 88.5, y, t, anchor="left")
    text(ax, 94, by + bh + 1.5, "SAÍDAS",
         color=PALETTE["danger"], size=10)

    # Mecanismos (base)
    mechs = [
        ("Doadores,\nRecebedores,\nVoluntários, Admins", bx + 3),
        ("Frontend\nNext.js 15 +\nReact 19", bx + 9),
        ("Backend\nNestJS 11\n(REST + JWT)", bx + 15),
        ("Prisma ORM +\nPostgreSQL 16", bx + 21),
    ]
    for t, mx in mechs:
        arrow(ax, mx, 18, mx, by)
        ax.text(mx, 16.5, t, fontsize=7.0, ha="center", va="top",
                color="#1d4ed8", fontweight="bold")
    text(ax, 50, 9.5, "MECANISMOS", color="#1d4ed8", size=10)

    # Legenda ICOM
    lx, ly = 78, 53
    ax.add_patch(Rectangle((lx, ly), 18, 9, fill=True,
                           facecolor="white",
                           edgecolor=PALETTE["primary"], lw=1.0))
    ax.text(lx + 9, ly + 8, "ICOM", fontsize=9, fontweight="bold",
            ha="center", va="center", color=PALETTE["primary"])
    items = [
        ("I", "Inputs — transformados pela função"),
        ("C", "Controls — regulam a função"),
        ("O", "Outputs — produtos da função"),
        ("M", "Mechanisms — executores"),
    ]
    for i, (k, v) in enumerate(items):
        ax.text(lx + 0.6, ly + 6.3 - i * 1.5,
                f"{k} — {v}", fontsize=6.8, va="center")

    save_pdf_and_png(fig, "IDEF0_N0")


def gen_n1():
    fig, ax = new_figure("A3", "A0",
                         "IDEF0 N1 — Decomposição da Plataforma",
                         "N1")

    boxes = [
        ("Gerenciar Usuários\ne Autenticação",
         "AuthModule + UsersModule", "A1",  8, 47, 18, 8),
        ("Gerenciar Catálogo\nde Doações",
         "DonationsModule + CategoriesModule", "A2", 28, 39, 18, 8),
        ("Coordenar\nEntregas",
         "DeliveriesModule",         "A3", 48, 31, 18, 8),
        ("Avaliar\nTransações",
         "ReviewsModule",            "A4", 68, 23, 18, 8),
        ("Administrar\ne Auditar",
         "AdminModule + AuditLog",   "A5", 78, 13, 18, 8),
    ]
    for label_, sub, num, x, y, w, h in boxes:
        box(ax, x, y, w, h, label_, sub=sub, num=num)

    # Fluxos internos
    arrow(ax, 8 + 18, 47 + 4, 28, 39 + 6)
    text(ax, 27.5, 46, "Usuário\nautenticado\n(JWT)", size=6.8)
    arrow(ax, 28 + 18, 39 + 4, 48, 31 + 6)
    text(ax, 47.5, 38, "Doação\nreservada", size=6.8)
    arrow(ax, 48 + 18, 31 + 4, 68, 23 + 6)
    text(ax, 67.5, 30, "Entrega\nconcluída", size=6.8)
    arrow(ax, 68 + 18, 23 + 4, 78, 13 + 6)
    text(ax, 88, 22, "Avaliações\n+ eventos", size=6.8)
    curved_arrow(ax, 28 + 9, 39, 78 + 6, 13 + 8, rad=-0.25,
                 ls="--", color=PALETTE["muted"])
    text(ax, 56, 24, "métricas de doação", size=6.8, color="#555555")

    # Entradas
    arrow(ax, 4, 51, 8, 51)
    text(ax, 4, 52.5, "Dados de cadastro,\ncredenciais", anchor="left", size=6.5)
    arrow(ax, 4, 41, 28, 41)
    text(ax, 4, 42.5, "Itens a doar\n(fotos, descrição)", anchor="left", size=6.5)
    arrow(ax, 4, 37, 28, 37)
    text(ax, 4, 38.4, "Necessidades\nde recebedor", anchor="left", size=6.5)
    arrow(ax, 4, 33, 48, 33)
    text(ax, 4, 34.5, "Disponibilidade\nde voluntário", anchor="left", size=6.5)
    text(ax, 5, 58.5, "ENTRADAS", color=PALETTE["accent"], size=9)

    # Controles
    ctrls = [
        ("LGPD,\nbcrypt", 17),
        ("Status DONATION\n(AVAILABLE→RESERVED→\nIN_TRANSIT→DELIVERED)", 37),
        ("Status DELIVERY\n(PENDING→ACCEPTED→\nIN_TRANSIT→DELIVERED)", 57),
        ("Regras de\nreview (1–5★)", 77),
        ("RBAC, Throttler,\npolíticas admin", 89),
    ]
    target_y = [47 + 8, 39 + 8, 31 + 8, 23 + 8, 13 + 8]
    for (t, cx), ty in zip(ctrls, target_y):
        arrow(ax, cx, 61, cx, ty)
        ax.text(cx, 63, t, fontsize=6.8, ha="center", va="bottom",
                color=PALETTE["warn"], fontweight="bold")

    # Saídas
    arrow(ax, 78 + 18, 13 + 6, 95, 13 + 6)
    text(ax, 94.5, 13 + 7.5, "Relatórios CSV,\nlogs, dashboard",
         anchor="right", size=6.5)
    arrow(ax, 68 + 18, 23 + 2, 95, 23 + 2)
    text(ax, 94.5, 23 + 3.2, "Reputação\n+ feedback", anchor="right", size=6.5)
    arrow(ax, 48 + 18, 31 + 2, 95, 31 + 2)
    text(ax, 94.5, 31 + 3.2, "Doações\nentregues", anchor="right", size=6.5)
    arrow(ax, 28 + 18, 39 + 2, 95, 39 + 2)
    text(ax, 94.5, 39 + 3.2, "Catálogo\nde doações", anchor="right", size=6.5)
    text(ax, 95, 58.5, "SAÍDAS", color=PALETTE["danger"], size=9)

    # Mecanismos
    mech_positions = [17, 37, 57, 77, 87]
    mech_texts = [
        "bcrypt +\nJWT/Passport",
        "Prisma\n(Donation,\nCategory)",
        "Prisma\n(DeliveryRequest,\nAddress)",
        "Prisma\n(Review)",
        "AuditLog,\nThrottlerGuard",
    ]
    box_bottoms = [47, 39, 31, 23, 13]
    for mx, mt, by in zip(mech_positions, mech_texts, box_bottoms):
        arrow(ax, mx, 7, mx, by)
        ax.text(mx, 6, mt, fontsize=6.8, ha="center", va="top",
                color="#1d4ed8", fontweight="bold")

    ax.text(50, 10, "MECANISMOS — NestJS + Prisma + PostgreSQL + Next.js",
            fontsize=8, ha="center", va="center",
            color="#1d4ed8", fontweight="bold",
            bbox=dict(facecolor="white", edgecolor="#1d4ed8",
                      boxstyle="round,pad=0.3"))

    save_pdf_and_png(fig, "IDEF0_N1")


if __name__ == "__main__":
    print("Gerando IDEF0...")
    gen_n0()
    gen_n1()
