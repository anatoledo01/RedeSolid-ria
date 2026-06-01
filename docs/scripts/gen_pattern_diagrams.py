"""Diagramas UML dos 3 padrões aplicados (Strategy / Observer / Decorator)."""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from _common import *


def uml(ax, x, y, w, h, name, attrs, methods,
        stereotype=None, is_abstract=False,
        face=None, edge=None):
    face = face or "white"
    edge = edge or PALETTE["primary"]
    ax.add_patch(Rectangle((x, y), w, h, fill=True,
                           facecolor=face, edgecolor=edge, lw=1.4))
    header_h = 2.4 if stereotype else 1.8
    ax.add_patch(Rectangle((x, y + h - header_h), w, header_h,
                           fill=True, facecolor=edge, edgecolor=edge))
    if stereotype:
        ax.text(x + w / 2, y + h - 0.7, f"«{stereotype}»",
                fontsize=7, ha="center", va="center",
                color="white", style="italic")
        ax.text(x + w / 2, y + h - 1.8,
                f"{name}{' (abstract)' if is_abstract else ''}",
                fontsize=9.5, ha="center", va="center",
                color="white", fontweight="bold",
                style="italic" if is_abstract else "normal")
    else:
        ax.text(x + w / 2, y + h - header_h / 2,
                f"{name}{' (abstract)' if is_abstract else ''}",
                fontsize=9.5, ha="center", va="center",
                color="white", fontweight="bold",
                style="italic" if is_abstract else "normal")
    body_top = y + h - header_h - 0.3
    for i, a in enumerate(attrs):
        ax.text(x + 0.3, body_top - 0.6 - i * 0.80, a,
                fontsize=6.5, va="center", color=PALETTE["text"])
    sep_y = body_top - 0.6 - len(attrs) * 0.80 + 0.05
    if methods:
        ax.plot([x, x + w], [sep_y, sep_y],
                color=PALETTE["primary"], lw=0.4)
    for i, m in enumerate(methods):
        ax.text(x + 0.3, sep_y - 0.7 - i * 0.80, m,
                fontsize=6.5, va="center", color=PALETTE["text"])


def inh(ax, x1, y1, x2, y2):
    """Herança: linha + triângulo vazio."""
    ax.plot([x1, x2], [y1, y2], color=PALETTE["primary"], lw=1.0)
    dx, dy = x2 - x1, y2 - y1
    L = (dx ** 2 + dy ** 2) ** 0.5 or 1
    ux, uy = dx / L, dy / L
    px, py = -uy, ux
    size = 1.2
    tip = (x2, y2)
    bl = (x2 - ux * size + px * size * 0.55,
          y2 - uy * size + py * size * 0.55)
    br = (x2 - ux * size - px * size * 0.55,
          y2 - uy * size - py * size * 0.55)
    ax.add_patch(Polygon([tip, bl, br], fill=True,
                          facecolor="white",
                          edgecolor=PALETTE["primary"], lw=1.0))


def impl(ax, x1, y1, x2, y2):
    """Realização (interface): linha tracejada + triângulo vazio."""
    ax.plot([x1, x2], [y1, y2], color=PALETTE["primary"],
            lw=1.0, ls=(0, (5, 3)))
    dx, dy = x2 - x1, y2 - y1
    L = (dx ** 2 + dy ** 2) ** 0.5 or 1
    ux, uy = dx / L, dy / L
    px, py = -uy, ux
    size = 1.2
    tip = (x2, y2)
    bl = (x2 - ux * size + px * size * 0.55,
          y2 - uy * size + py * size * 0.55)
    br = (x2 - ux * size - px * size * 0.55,
          y2 - uy * size - py * size * 0.55)
    ax.add_patch(Polygon([tip, bl, br], fill=True,
                          facecolor="white",
                          edgecolor=PALETTE["primary"], lw=1.0))


def assoc(ax, x1, y1, x2, y2, lbl=None, role_a="", role_b=""):
    ax.plot([x1, x2], [y1, y2], color=PALETTE["primary"], lw=1.0)
    # losango aberto no início (agregação) — opcional, deixei só linha
    if lbl:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx, my, lbl, fontsize=6.5, ha="center", va="center",
                color=PALETTE["neutral"], style="italic",
                bbox=dict(facecolor="white", edgecolor="none", pad=0.4))


def dep(ax, x1, y1, x2, y2, lbl=None):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2),
                                  arrowstyle="->", mutation_scale=10,
                                  color=PALETTE["neutral"], lw=0.9,
                                  ls=(0, (4, 3))))
    if lbl:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx, my, lbl, fontsize=6.3, ha="center", va="center",
                color=PALETTE["neutral"], style="italic",
                bbox=dict(facecolor="white", edgecolor="none", pad=0.5))


# =================================================================
# STRATEGY
# =================================================================
def gen_strategy():
    fig, ax = new_figure("A3", "STRATEGY",
                         "Padrão Strategy — NotificationStrategy",
                         "GoF-Strategy")

    # Contexto (Client / Service)
    ctx_x, ctx_y, ctx_w, ctx_h = 6, 45, 26, 14
    uml(ax, ctx_x, ctx_y, ctx_w, ctx_h, "NotificationService",
        attrs=["- strategy: NotificationStrategy"],
        methods=[
            "+ constructor(s: NotificationStrategy)",
            "+ setStrategy(s: NotificationStrategy)",
            "+ notify(p): Promise<NotificationResult>",
            "",
            "→ Delegação: this.strategy.send(p)",
        ],
        face="#e0e7ff", edge="#4338ca")

    # Interface Strategy (centro)
    if_x, if_y, if_w, if_h = 40, 47, 24, 10
    uml(ax, if_x, if_y, if_w, if_h, "NotificationStrategy",
        attrs=["+ channel: string (readonly)"],
        methods=[
            "+ send(p: NotificationPayload):",
            "    Promise<NotificationResult>",
        ],
        stereotype="interface",
        face=PALETTE["primary_light"])

    # Estratégias concretas (3 colunas abaixo)
    s1_x, s1_y, s1_w, s1_h = 8, 18, 26, 14
    uml(ax, s1_x, s1_y, s1_w, s1_h, "ConsoleNotificationStrategy",
        attrs=["+ channel = 'console'", "- logger: Logger"],
        methods=[
            "+ send(p)",
            "    log no console NestJS",
            "→ default em desenvolvimento",
        ],
        face=PALETTE["accent_light"], edge=PALETTE["accent"])

    s2_x, s2_y, s2_w, s2_h = 37, 18, 26, 14
    uml(ax, s2_x, s2_y, s2_w, s2_h, "EmailNotificationStrategy",
        attrs=[
            "+ channel = 'email'",
            "- config: { fromAddress; provider }",
        ],
        methods=[
            "+ send(p)",
            "    valida email + envia",
            "→ provedores: SES / SendGrid",
        ],
        face=PALETTE["accent_light"], edge=PALETTE["accent"])

    s3_x, s3_y, s3_w, s3_h = 66, 18, 26, 14
    uml(ax, s3_x, s3_y, s3_w, s3_h, "InAppNotificationStrategy",
        attrs=[
            "+ channel = 'in-app'",
            "- inbox: InAppInbox",
        ],
        methods=[
            "+ send(p)",
            "    grava na inbox do usuário",
            "→ aparece no sino do app",
        ],
        face=PALETTE["accent_light"], edge=PALETTE["accent"])

    # Cliente real
    cl_x, cl_y, cl_w, cl_h = 68, 45, 26, 13
    uml(ax, cl_x, cl_y, cl_w, cl_h, "DonationsService",
        attrs=["- notifier: NotificationService"],
        methods=[
            "+ reserve(id, receiverId)",
            "  → updated + notifier.notify({...})",
        ],
        stereotype="injectable",
        face="#fef9c3", edge=PALETTE["warn"])

    # Relações
    # NotificationService -> Strategy (associação / agregação)
    assoc(ax, ctx_x + ctx_w, ctx_y + ctx_h / 2,
          if_x, if_y + if_h / 2, "delega a")
    # Strategy <- Estratégias concretas (realização)
    impl(ax, s1_x + s1_w / 2, s1_y + s1_h, if_x + 4, if_y)
    impl(ax, s2_x + s2_w / 2, s2_y + s2_h, if_x + if_w / 2, if_y)
    impl(ax, s3_x + s3_w / 2, s3_y + s3_h, if_x + if_w - 4, if_y)
    # DonationsService -> NotificationService
    dep(ax, cl_x, cl_y + cl_h / 2,
        ctx_x + ctx_w, cl_y + cl_h / 2, "usa")

    # Legenda
    lx, ly = 2, 7
    ax.add_patch(Rectangle((lx, ly), 22, 7, fill=True,
                           facecolor="white",
                           edgecolor=PALETTE["primary"], lw=0.6))
    ax.text(lx + 11, ly + 6, "Legenda UML",
            fontsize=8, fontweight="bold", ha="center",
            color=PALETTE["primary"])
    items = [
        ("─▷",   "herança / realização"),
        ("---▷", "dependência («uses»)"),
        ("«interface»", "contrato (em TypeScript: interface)"),
    ]
    for i, (k, v) in enumerate(items):
        ax.text(lx + 0.4, ly + 4.5 - i * 1.3, k,
                fontsize=7, color=PALETTE["primary"],
                fontweight="bold")
        ax.text(lx + 6, ly + 4.5 - i * 1.3, v,
                fontsize=6.5, color=PALETTE["text"])

    save_pdf_and_png(fig, "Padrao_Strategy")


# =================================================================
# OBSERVER
# =================================================================
def gen_observer():
    fig, ax = new_figure("A3", "OBSERVER",
                         "Padrão Observer — DonationEventBus",
                         "GoF-Observer")

    # Subject (interface)
    sub_x, sub_y, sub_w, sub_h = 38, 50, 24, 12
    uml(ax, sub_x, sub_y, sub_w, sub_h, "DonationSubject",
        attrs=[],
        methods=[
            "+ subscribe(o: DonationObserver): void",
            "+ unsubscribe(o: DonationObserver): void",
            "+ notify(event: DonationEvent): void",
        ],
        stereotype="interface",
        face=PALETTE["primary_light"])

    # Concrete Subject
    cs_x, cs_y, cs_w, cs_h = 6, 50, 26, 12
    uml(ax, cs_x, cs_y, cs_w, cs_h, "DonationEventBus",
        attrs=[
            "- observers: DonationObserver[] = []",
        ],
        methods=[
            "+ subscribe(o), unsubscribe(o)",
            "+ notify(event) → todos os observers",
            "+ emit(donationId, status) → notify(...)",
        ],
        face="#e0e7ff", edge="#4338ca")

    # Cliente que emite
    cli_x, cli_y, cli_w, cli_h = 6, 36, 26, 10
    uml(ax, cli_x, cli_y, cli_w, cli_h, "DonationsService",
        attrs=["- bus: DonationEventBus"],
        methods=[
            "+ updateStatus(...) → ... + bus.emit()",
            "+ reserve(...)      → ... + bus.emit()",
        ],
        stereotype="injectable",
        face="#fef9c3", edge=PALETTE["warn"])

    # Observer (interface)
    obs_x, obs_y, obs_w, obs_h = 38, 36, 24, 10
    uml(ax, obs_x, obs_y, obs_w, obs_h, "DonationObserver",
        attrs=[],
        methods=[
            "+ update(event: DonationEvent):",
            "    Promise<void>",
        ],
        stereotype="interface",
        face=PALETTE["primary_light"])

    # Concrete observers
    o1_x, o1_y, o1_w, o1_h = 68, 50, 26, 12
    uml(ax, o1_x, o1_y, o1_w, o1_h, "NotifyDonorObserver",
        attrs=["- notifier: NotificationService"],
        methods=[
            "+ update(event)",
            "  → notifier.notify(doador)",
        ],
        face=PALETTE["accent_light"], edge=PALETTE["accent"])

    o2_x, o2_y, o2_w, o2_h = 68, 36, 26, 12
    uml(ax, o2_x, o2_y, o2_w, o2_h, "AuditTrailObserver",
        attrs=["- prisma: PrismaService"],
        methods=[
            "+ update(event)",
            "  → cria AuditLog",
        ],
        face=PALETTE["accent_light"], edge=PALETTE["accent"])

    o3_x, o3_y, o3_w, o3_h = 68, 22, 26, 12
    uml(ax, o3_x, o3_y, o3_w, o3_h, "DashboardCacheObserver",
        attrs=["- cache: Map<string, number>"],
        methods=[
            "+ update(event)",
            "  → invalida métricas no cache",
        ],
        face=PALETTE["accent_light"], edge=PALETTE["accent"])

    # Relações
    impl(ax, cs_x + cs_w, cs_y + cs_h / 2, sub_x, sub_y + sub_h / 2)
    dep(ax, cli_x + cli_w / 2, cli_y + cli_h,
        cs_x + cs_w / 2, cs_y, "emit()")
    # Observers realizam DonationObserver
    impl(ax, o1_x, o1_y + 2, obs_x + obs_w, obs_y + obs_h - 2)
    impl(ax, o2_x, o2_y + o2_h / 2, obs_x + obs_w, obs_y + 2)
    impl(ax, o3_x, o3_y + o3_h - 2, obs_x + obs_w, obs_y + 1)
    # Subject conhece Observer (agregação)
    assoc(ax, sub_x + sub_w / 2, sub_y, obs_x + obs_w / 2, obs_y + obs_h,
          "0..*")

    # Legenda
    lx, ly = 2, 7
    ax.add_patch(Rectangle((lx, ly), 22, 7, fill=True,
                           facecolor="white",
                           edgecolor=PALETTE["primary"], lw=0.6))
    ax.text(lx + 11, ly + 6, "Legenda",
            fontsize=8, fontweight="bold", ha="center",
            color=PALETTE["primary"])
    items = [
        "Subject mantém a lista de observers.",
        "Quando emit() é chamado, todos os",
        "observers recebem update(event).",
        "Trocar/adicionar observer não muda",
        "o código do Subject ou do Service.",
    ]
    for i, t in enumerate(items):
        ax.text(lx + 0.4, ly + 4.8 - i * 0.95, t,
                fontsize=6.5, color=PALETTE["text"])

    save_pdf_and_png(fig, "Padrao_Observer")


# =================================================================
# DECORATOR
# =================================================================
def gen_decorator():
    fig, ax = new_figure("A3", "DECORATOR",
                         "Padrão Decorator — DonationRepository",
                         "GoF-Decorator")

    # Component (interface)
    if_x, if_y, if_w, if_h = 40, 50, 24, 12
    uml(ax, if_x, if_y, if_w, if_h, "DonationRepository",
        attrs=[],
        methods=[
            "+ findOne(id): Promise<Donation>",
            "+ create(data): Promise<Donation>",
            "+ updateStatus(id, status):",
            "    Promise<Donation>",
        ],
        stereotype="interface",
        face=PALETTE["primary_light"])

    # ConcreteComponent
    cc_x, cc_y, cc_w, cc_h = 6, 50, 26, 12
    uml(ax, cc_x, cc_y, cc_w, cc_h, "PrismaDonationRepository",
        attrs=["- prisma: PrismaService"],
        methods=[
            "+ findOne(id)    → prisma.donation.findUnique",
            "+ create(data)   → prisma.donation.create",
            "+ updateStatus() → prisma.donation.update",
        ],
        face="#fef9c3", edge=PALETTE["warn"])

    # Decorator base
    db_x, db_y, db_w, db_h = 40, 32, 24, 12
    uml(ax, db_x, db_y, db_w, db_h, "DonationRepositoryDecorator",
        attrs=[
            "# inner: DonationRepository",
        ],
        methods=[
            "+ findOne(id)    → inner.findOne(id)",
            "+ create(data)   → inner.create(data)",
            "+ updateStatus() → inner.updateStatus()",
        ],
        is_abstract=True,
        face=PALETTE["primary_light"])

    # Concrete decorators
    d1_x, d1_y, d1_w, d1_h = 6, 14, 26, 14
    uml(ax, d1_x, d1_y, d1_w, d1_h, "AuditDecorator",
        attrs=[
            "# inner",
            "- auditService: AuditService",
        ],
        methods=[
            "+ updateStatus(id, status):",
            "    const result = await inner.updateStatus(...)",
            "    auditService.log({ entity, action })",
            "    return result",
        ],
        face=PALETTE["accent_light"], edge=PALETTE["accent"])

    d2_x, d2_y, d2_w, d2_h = 37, 14, 26, 14
    uml(ax, d2_x, d2_y, d2_w, d2_h, "TimingDecorator",
        attrs=[
            "# inner",
            "- logger: Logger",
        ],
        methods=[
            "+ findOne(id):",
            "    const t0 = Date.now()",
            "    const r  = await inner.findOne(id)",
            "    logger.log(`${Date.now()-t0}ms`)",
            "    return r",
        ],
        face=PALETTE["accent_light"], edge=PALETTE["accent"])

    d3_x, d3_y, d3_w, d3_h = 68, 14, 26, 14
    uml(ax, d3_x, d3_y, d3_w, d3_h, "CacheDecorator",
        attrs=[
            "# inner",
            "- cache: Map<string, Donation>",
        ],
        methods=[
            "+ findOne(id):",
            "    return cache.get(id) ??",
            "      cache.set(id, inner.findOne(id))",
        ],
        face=PALETTE["accent_light"], edge=PALETTE["accent"])

    # Relações
    impl(ax, cc_x + cc_w, cc_y + cc_h / 2, if_x, if_y + cc_h / 2)
    impl(ax, db_x + db_w / 2, db_y + db_h, if_x + if_w / 2, if_y)
    inh(ax, d1_x + d1_w / 2, d1_y + d1_h, db_x + 4, db_y)
    inh(ax, d2_x + d2_w / 2, d2_y + d2_h, db_x + db_w / 2, db_y)
    inh(ax, d3_x + d3_w / 2, d3_y + d3_h, db_x + db_w - 4, db_y)
    # Decorator wraps Component (agregação)
    assoc(ax, db_x + db_w, db_y + db_h / 2,
          if_x + if_w, if_y, "envolve")

    # Exemplo de composição
    ax.text(50, 8, "Exemplo de composição: new AuditDecorator(new TimingDecorator("
                    "new CacheDecorator(new PrismaDonationRepository(prisma))))",
            fontsize=7.5, ha="center", color=PALETTE["text"],
            bbox=dict(facecolor=PALETTE["primary_light"],
                      edgecolor=PALETTE["primary"], pad=4))
    ax.text(50, 6, "Cada camada adiciona uma responsabilidade sem alterar as outras "
                    "(Open/Closed).",
            fontsize=7, ha="center", color=PALETTE["neutral"], style="italic")

    save_pdf_and_png(fig, "Padrao_Decorator")


if __name__ == "__main__":
    print("Gerando diagramas dos padrões...")
    gen_strategy()
    gen_observer()
    gen_decorator()
