"""Diagrama UML de classes da hierarquia de Usuários (Tarefa 17)."""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from _common import *


def uml_class(ax, x, y, w, h, name, attrs, methods,
              is_abstract=False, stereotype=None,
              face=None, edge=None):
    face = face or "white"
    edge = edge or PALETTE["primary"]
    # Bloco principal
    ax.add_patch(Rectangle((x, y), w, h, fill=True,
                           facecolor=face,
                           edgecolor=edge, lw=1.4))
    # Cabeçalho
    header_h = 2.6 if stereotype else 2.0
    ax.add_patch(Rectangle((x, y + h - header_h), w, header_h,
                           fill=True, facecolor=edge,
                           edgecolor=edge))
    if stereotype:
        ax.text(x + w / 2, y + h - 0.7, f"«{stereotype}»",
                fontsize=7.5, ha="center", va="center",
                color="white", style="italic")
        ax.text(x + w / 2, y + h - 1.8,
                f"{name}{' (abstract)' if is_abstract else ''}",
                fontsize=10, ha="center", va="center",
                fontweight="bold", color="white",
                style="italic" if is_abstract else "normal")
    else:
        ax.text(x + w / 2, y + h - header_h / 2,
                f"{name}{'  (abstract)' if is_abstract else ''}",
                fontsize=10, ha="center", va="center",
                fontweight="bold", color="white",
                style="italic" if is_abstract else "normal")
    # Linhas divisórias
    body_top = y + h - header_h - 0.3
    # Atributos
    for i, a in enumerate(attrs):
        ax.text(x + 0.3, body_top - 0.7 - i * 0.85, a,
                fontsize=6.8, va="center", color=PALETTE["text"])
    sep_y = body_top - 0.7 - len(attrs) * 0.85 + 0.1
    ax.plot([x, x + w], [sep_y, sep_y],
            color=PALETTE["primary"], lw=0.5)
    # Métodos
    for i, m in enumerate(methods):
        ax.text(x + 0.3, sep_y - 0.7 - i * 0.85, m,
                fontsize=6.8, va="center", color=PALETTE["text"],
                style="italic" if m.startswith("+ abstract") else "normal")


def inh_arrow(ax, x1, y1, x2, y2):
    """Seta de herança UML: linha + triângulo vazio na ponta."""
    ax.plot([x1, x2], [y1, y2],
            color=PALETTE["primary"], lw=1.0)
    # Triângulo simples
    import numpy as np
    dx, dy = x2 - x1, y2 - y1
    L = (dx ** 2 + dy ** 2) ** 0.5
    ux, uy = dx / L, dy / L
    # base do triângulo (perpendicular)
    px, py = -uy, ux
    size = 1.2
    tip = (x2, y2)
    base_l = (x2 - ux * size + px * size * 0.6,
              y2 - uy * size + py * size * 0.6)
    base_r = (x2 - ux * size - px * size * 0.6,
              y2 - uy * size - py * size * 0.6)
    ax.add_patch(Polygon([tip, base_l, base_r], fill=True,
                          facecolor="white",
                          edgecolor=PALETTE["primary"], lw=1.0))


def dep_arrow(ax, x1, y1, x2, y2, lbl=None):
    """Seta de dependência: tracejada com ponta aberta."""
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2),
                                  arrowstyle="->", mutation_scale=10,
                                  color=PALETTE["neutral"], lw=0.9,
                                  ls=(0, (4, 3))))
    if lbl:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx, my, lbl, fontsize=6.4, ha="center", va="center",
                color=PALETTE["neutral"], style="italic",
                bbox=dict(facecolor="white", edgecolor="none", pad=0.5))


def gen():
    fig, ax = new_figure("A3", "CLASS",
                         "Diagrama de Classes — Domínio de Usuários",
                         "CLASS-01")

    # AbstractUser (topo, centralizado)
    abs_x, abs_y, abs_w, abs_h = 36, 41, 28, 22
    uml_class(ax, abs_x, abs_y, abs_w, abs_h, "AbstractUser",
              attrs=[
                  "# _id: string (readonly)",
                  "# _name: string",
                  "# _email: string (readonly)",
                  "# _passwordHash: string (readonly)",
                  "# _phone: string | null",
                  "# _avatar: string | null",
                  "# _isApproved: boolean",
                  "# _isActive: boolean",
                  "# _createdAt: Date (readonly)",
                  "# _updatedAt: Date",
              ],
              methods=[
                  "+ get role(): Role  «abstract»",
                  "+ abstract canPerform(a: Action): boolean",
                  "+ abstract getDashboardRoute(): string",
                  "+ block(reason?: string): void",
                  "+ unblock(): void",
                  "+ approve(): void",
                  "+ updateProfile(partial): void",
                  "+ toPublicJSON(): UserDTO",
              ],
              is_abstract=True,
              face=PALETTE["primary_light"])

    # Subclasses concretas
    sub_y = 14
    sub_w, sub_h = 18, 19
    classes = [
        ("Admin",    0, "Admin pode tudo,\nexceto reservar/aceitar"),
        ("Donor",    21, "Doador cria doação\ne avalia"),
        ("Volunteer",42, "Voluntário (precisa\naprovação para\naceitar entrega)"),
        ("Receiver", 63, "Recebedor reserva\ne avalia"),
    ]

    sub_positions = []
    for name, xoff, desc in classes:
        sx = 2 + xoff
        sub_positions.append((sx, sub_y, sx + sub_w / 2,
                              sub_y + sub_h, name, desc))
        uml_class(ax, sx, sub_y, sub_w, sub_h, name,
                  attrs=["(herda atributos\n  de AbstractUser)"],
                  methods=[
                      "+ get role(): Role",
                      "+ canPerform(a): boolean",
                      "+ getDashboardRoute(): string",
                      "",
                      desc,
                  ])

    # Setas de herança (filho -> pai)
    for sx, sy, top_x, top_y, name, _ in sub_positions:
        inh_arrow(ax, top_x, top_y, top_x, abs_y)
        # transformar em "tronco" comum: linha horizontal antes
        # já está feito por linhas individuais; ok

    # ===== UserFactory (à direita) =====
    f_x, f_y, f_w, f_h = 72, 50, 24, 12
    uml_class(ax, f_x, f_y, f_w, f_h, "UserFactory",
              attrs=[
                  "(somente estático)",
              ],
              methods=[
                  "+ static fromPrisma(record: PrismaUser):",
                  "    AbstractUser",
                  "",
                  "switch(record.role) {",
                  "  ADMIN→Admin, DONOR→Donor,",
                  "  VOLUNTEER→Volunteer,",
                  "  RECEIVER→Receiver",
                  "}",
              ],
              stereotype="factory",
              face=PALETTE["accent_light"], edge=PALETTE["accent"])
    dep_arrow(ax, f_x, f_y + f_h / 2, abs_x + abs_w, f_y + f_h / 2,
              "cria")

    # ===== Action / UserProps (auxiliares à esquerda) =====
    aux_x, aux_y, aux_w, aux_h = 2, 50, 28, 12
    uml_class(ax, aux_x, aux_y, aux_w, aux_h, "Action",
              attrs=[
                  "'donation:create'",
                  "'donation:reserve'",
                  "'donation:moderate'",
                  "'delivery:accept'",
                  "'delivery:update-status'",
                  "'review:write'",
                  "'admin:dashboard' | 'admin:export-report'",
                  "'admin:approve-user' | 'admin:block-user'",
                  "'admin:audit-log'",
              ],
              methods=[],
              stereotype="union type",
              face="#fef9c3", edge=PALETTE["warn"])
    dep_arrow(ax, aux_x + aux_w, aux_y + aux_h / 2,
              abs_x, aux_y + aux_h / 2, "usado em\ncanPerform()")

    # ===== UsersService (NestJS, embaixo, mostra integração) =====
    svc_x, svc_y, svc_w, svc_h = 36, 2, 28, 9
    uml_class(ax, svc_x, svc_y, svc_w, svc_h, "UsersService",
              attrs=[
                  "- prisma: PrismaService",
              ],
              methods=[
                  "+ approve(id): Promise<User>",
                  "+ block(id): Promise<User>",
                  "+ can(id, action): Promise<boolean>",
                  "    (usa UserFactory + canPerform)",
              ],
              stereotype="injectable",
              face="#e0e7ff", edge="#4338ca")
    # dependência: UsersService usa UserFactory
    dep_arrow(ax, svc_x + svc_w - 4, svc_y + svc_h,
              f_x + 2, f_y, "usa")

    # ===== Legenda =====
    lx, ly = 2, 2
    ax.add_patch(Rectangle((lx, ly), 22, 8, fill=True,
                           facecolor="white",
                           edgecolor=PALETTE["primary"], lw=0.6))
    ax.text(lx + 11, ly + 7, "Legenda UML",
            fontsize=8, fontweight="bold", ha="center",
            color=PALETTE["primary"])
    items = [
        ("+", "público"),
        ("#", "protected (encapsulado)"),
        ("-", "privado"),
        ("«abstract»", "classe abstrata"),
        ("─▷", "herança (filho → pai)"),
        ("---▷", "dependência («uses»)"),
    ]
    for i, (k, v) in enumerate(items):
        ax.text(lx + 0.4, ly + 5.8 - i * 0.95, k,
                fontsize=7, fontweight="bold",
                color=PALETTE["primary"])
        ax.text(lx + 5, ly + 5.8 - i * 0.95, v,
                fontsize=6.6, color=PALETTE["text"])

    save_pdf_and_png(fig, "DiagramaClasses")


if __name__ == "__main__":
    print("Gerando Diagrama de Classes...")
    gen()
