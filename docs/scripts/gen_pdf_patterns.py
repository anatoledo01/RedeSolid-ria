"""Gera 3 PDFs explicativos — um por padrão (Strategy/Observer/Decorator)."""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image,
                                 PageBreak, Table, TableStyle, Preformatted)

ROOT = "/Users/jhonatanrabelo/Documents/Fatec/Eng 3/Projeto/RedeSolid-ria"
DIAG = os.path.join(ROOT, "docs", "diagramas")


def get_styles():
    styles = getSampleStyleSheet()
    return {
        "h1": ParagraphStyle("h1", parent=styles["Heading1"],
                              textColor=colors.HexColor("#1f3a5f"),
                              spaceAfter=12, fontSize=18),
        "h2": ParagraphStyle("h2", parent=styles["Heading2"],
                              textColor=colors.HexColor("#1f3a5f"),
                              spaceAfter=8, fontSize=14),
        "h3": ParagraphStyle("h3", parent=styles["Heading3"],
                              textColor=colors.HexColor("#10b981"),
                              spaceAfter=6, fontSize=12),
        "body": ParagraphStyle("body", parent=styles["BodyText"],
                                 alignment=TA_JUSTIFY, fontSize=10,
                                 spaceAfter=6, leading=14),
        "code": ParagraphStyle("code", parent=styles["Code"], fontSize=8,
                                 leftIndent=4, leading=10),
        "cap": ParagraphStyle("cap", parent=styles["Italic"],
                                alignment=TA_CENTER, fontSize=9,
                                textColor=colors.HexColor("#475569")),
    }


def header_table(rows):
    t = Table(rows, colWidths=[5 * cm, 11 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f3a5f")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


# ============================================================
# STRATEGY
# ============================================================
def build_strategy(out_path):
    s = get_styles()
    doc = SimpleDocTemplate(out_path, pagesize=A4,
                             leftMargin=2 * cm, rightMargin=2 * cm,
                             topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    story = []

    story.append(Paragraph("Tarefa 20 — Padrão Strategy", s["h1"]))
    story.append(Paragraph("NotificationStrategy aplicado à Rede Solidária",
                            s["h2"]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Objetivo", s["h3"]))
    story.append(Paragraph(
        "Quando uma doação é reservada, o doador precisa ser avisado. Mas "
        "<i>como</i> ele será avisado pode variar: por <b>e-mail</b>, por "
        "<b>notificação in-app</b>, por <b>SMS</b> futuramente, ou apenas no "
        "<b>log do servidor</b> em desenvolvimento. Em vez de espalhar "
        "<i>switch(channel)</i> pelos serviços, encapsulamos cada canal em "
        "uma <b>estratégia</b> intercambiável. O DonationsService consome "
        "apenas a interface NotificationStrategy.",
        s["body"]))

    story.append(Image(os.path.join(DIAG, "Padrao_Strategy.png"),
                       width=16.5 * cm, height=10.5 * cm))
    story.append(Paragraph("Figura — Estrutura UML do Strategy aplicado",
                            s["cap"]))

    story.append(Paragraph("Elementos do padrão", s["h3"]))
    story.append(header_table([
        ["Papel GoF", "Implementação na Rede Solidária"],
        ["Strategy (interface)",
         "NotificationStrategy — contrato com channel + send(payload)"],
        ["ConcreteStrategy",
         "ConsoleNotificationStrategy, EmailNotificationStrategy, "
         "InAppNotificationStrategy"],
        ["Context",
         "NotificationService — recebe a estratégia no construtor; "
         "setStrategy() troca em runtime"],
        ["Client",
         "DonationsService.reserve() — chama notifier.notify() sem "
         "saber qual canal está ativo"],
    ]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Por que Strategy aqui?", s["h3"]))
    motivos = [
        "<b>Aberto à extensão, fechado à modificação</b>: para suportar "
        "Push notifications, basta criar PushNotificationStrategy — nada "
        "muda no DonationsService.",
        "<b>Substituível em testes</b>: o spec instancia "
        "FakeNotificationStrategy que apenas registra os payloads recebidos.",
        "<b>Configurável por ambiente</b>: em dev, ConsoleStrategy; em "
        "produção, EmailStrategy(provider:'ses'). A decisão fica em um único "
        "lugar.",
    ]
    for m in motivos:
        story.append(Paragraph("•  " + m, s["body"]))

    story.append(PageBreak())

    story.append(Paragraph("Integração no DonationsService", s["h3"]))
    story.append(Preformatted(
        "@Injectable()\n"
        "export class DonationsService {\n"
        "  private readonly notifier = new NotificationService(\n"
        "    new ConsoleNotificationStrategy(),\n"
        "  );\n"
        "\n"
        "  async reserve(id: string, receiverId: string) {\n"
        "    const updated = await this.prisma.donation.update({ ... });\n"
        "\n"
        "    await this.notifier.notify({\n"
        "      to: updated.donor.email,\n"
        "      subject: `Sua doação \"${updated.title}\" foi reservada`,\n"
        "      body:    `Olá ${updated.donor.name}, ...`,\n"
        "      metadata: { donationId: id, event: 'RESERVED' },\n"
        "    });\n"
        "\n"
        "    return updated;\n"
        "  }\n"
        "}",
        s["code"]))

    story.append(Paragraph("Saída da demo (demo_strategy.ts)", s["h3"]))
    story.append(Preformatted(
        "=== 1. Estratégia inicial: Console ===\n"
        "  [console → maria@email.com] Doação reservada\n"
        "            A sua doação \"Cesta básica completa\" foi reservada por Esperança.\n"
        "\n"
        "=== 2. Troca em runtime: Email ===\n"
        "  [email contato@redesolidaria.org → carlos@email.com] Voluntário a caminho\n"
        "\n"
        "=== 3. Troca para In-app ===\n"
        "  [in-app userId=usr_42] Bem-vinda à Rede! (inbox=inbox-1)\n"
        "\n"
        "=== 4. Erro tratado pela estratégia (email inválido) ===\n"
        "   resultado: { ok: false, channel: 'email', error: 'email inválido' }",
        s["code"]))

    story.append(Paragraph("Arquivos entregues", s["h3"]))
    story.append(header_table([
        ["Arquivo", "Conteúdo"],
        ["notification.strategy.ts",
         "Implementação real usada no backend (cópia idêntica)."],
        ["demo_strategy.ts",
         "Demonstração standalone — rode com ts-node demo_strategy.ts"],
        ["Padrao_Strategy.pdf / .png", "Diagrama UML"],
        ["Explicacao_Padrao_Strategy.pdf", "Este documento"],
    ]))

    doc.build(story)
    print(f"  -> {out_path}")


# ============================================================
# OBSERVER
# ============================================================
def build_observer(out_path):
    s = get_styles()
    doc = SimpleDocTemplate(out_path, pagesize=A4,
                             leftMargin=2 * cm, rightMargin=2 * cm,
                             topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    story = []

    story.append(Paragraph("Tarefa 26 — Padrão Observer", s["h1"]))
    story.append(Paragraph("DonationEventBus aplicado à Rede Solidária",
                            s["h2"]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Objetivo", s["h3"]))
    story.append(Paragraph(
        "Quando uma doação muda de status (AVAILABLE → RESERVED → "
        "DELIVERED), vários efeitos colaterais podem precisar acontecer: "
        "<b>notificar o doador</b>, <b>gravar log de auditoria</b>, "
        "<b>invalidar o cache do dashboard</b>, eventualmente "
        "<b>disparar webhook</b> para parceiros. Em vez de o "
        "DonationsService conhecer todos esses consumidores, ele publica um "
        "<b>evento</b> num barramento; os interessados se inscrevem.",
        s["body"]))

    story.append(Image(os.path.join(DIAG, "Padrao_Observer.png"),
                       width=16.5 * cm, height=10.5 * cm))
    story.append(Paragraph("Figura — Estrutura UML do Observer aplicado",
                            s["cap"]))

    story.append(Paragraph("Elementos do padrão", s["h3"]))
    story.append(header_table([
        ["Papel GoF", "Implementação na Rede Solidária"],
        ["Subject (interface)",
         "DonationSubject — subscribe / unsubscribe / notify"],
        ["ConcreteSubject",
         "DonationEventBus — mantém a lista observers; expõe emit() para o "
         "service notificar mudanças"],
        ["Observer (interface)",
         "DonationObserver — update(event)"],
        ["ConcreteObservers",
         "NotifyDonorObserver, AuditTrailObserver, DashboardCacheObserver"],
    ]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Por que Observer aqui?", s["h3"]))
    motivos = [
        "<b>Acoplamento solto</b>: o DonationsService não conhece os "
        "observers — só publica eventos. Adicionar um WebhookObserver é "
        "uma linha no main bootstrap.",
        "<b>Independência de evolução</b>: cada observer pode falhar "
        "isoladamente sem derrubar o fluxo principal (em produção, "
        "encapsulamos cada update em try/catch e logamos).",
        "<b>Visibilidade da regra</b>: ‘toda reserva gera log de "
        "auditoria’ vira o AuditTrailObserver — explícito e testável.",
    ]
    for m in motivos:
        story.append(Paragraph("•  " + m, s["body"]))

    story.append(PageBreak())

    story.append(Paragraph("Integração no backend", s["h3"]))
    story.append(Preformatted(
        "// backend/src/domain/events/donation-event-bus.ts\n"
        "export class DonationEventBus implements DonationSubject {\n"
        "  private readonly observers: DonationObserver[] = [];\n"
        "  subscribe(o)   { this.observers.push(o); }\n"
        "  unsubscribe(o) { /* remove */ }\n"
        "  async notify(event: DonationEvent) {\n"
        "    for (const o of this.observers) {\n"
        "      try { await o.update(event); }\n"
        "      catch (err) { this.logger.warn(`obs ${o.name} falhou`, err); }\n"
        "    }\n"
        "  }\n"
        "  emit(donationId, status, actor) {\n"
        "    return this.notify({ donationId, status, actor, at: new Date() });\n"
        "  }\n"
        "}\n"
        "\n"
        "// Em DonationsService:\n"
        "await this.bus.emit(updated.id, 'RESERVED', receiverId);",
        s["code"]))

    story.append(Paragraph("Saída da demo (demo_observer.ts)", s["h3"]))
    story.append(Preformatted(
        "[bus] inscrito: NotifyDonorObserver\n"
        "[bus] inscrito: AuditTrailObserver\n"
        "[bus] inscrito: DashboardCacheObserver\n"
        "\n"
        "→ emit RESERVED (doação d-101)\n"
        "  [Notify]  email para maria@email.com: \"sua doação foi reservada\"\n"
        "  [Audit]   AuditLog gravado: action=donation:reserved\n"
        "  [Cache]   invalidando dashboard:donations:available\n"
        "\n"
        "→ emit DELIVERED (doação d-101)\n"
        "  [Notify]  email para esperanca@ong.org: \"doação entregue\"\n"
        "  [Audit]   AuditLog gravado: action=donation:delivered\n"
        "  [Cache]   invalidando dashboard:donations:delivered",
        s["code"]))

    story.append(Paragraph("Arquivos entregues", s["h3"]))
    story.append(header_table([
        ["Arquivo", "Conteúdo"],
        ["donation-event-bus.ts",
         "Subject + Observer interfaces + implementação real (cópia da "
         "backend/src/domain/events/)"],
        ["demo_observer.ts",
         "Demonstração standalone"],
        ["Padrao_Observer.pdf / .png", "Diagrama UML"],
        ["Explicacao_Padrao_Observer.pdf", "Este documento"],
    ]))

    doc.build(story)
    print(f"  -> {out_path}")


# ============================================================
# DECORATOR
# ============================================================
def build_decorator(out_path):
    s = get_styles()
    doc = SimpleDocTemplate(out_path, pagesize=A4,
                             leftMargin=2 * cm, rightMargin=2 * cm,
                             topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    story = []

    story.append(Paragraph("Tarefa 30 — Padrão Decorator", s["h1"]))
    story.append(Paragraph("Repository decorators aplicados à Rede Solidária",
                            s["h2"]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Objetivo", s["h3"]))
    story.append(Paragraph(
        "Algumas responsabilidades transversais — <b>auditoria</b>, "
        "<b>medição de tempo</b>, <b>cache em memória</b> — não pertencem à "
        "lógica de acesso ao banco (Prisma). Em vez de poluir o "
        "PrismaDonationRepository com if/log/cache, encadeamos "
        "<b>decoradores</b> que envolvem o repositório base preservando o "
        "mesmo contrato.",
        s["body"]))

    story.append(Image(os.path.join(DIAG, "Padrao_Decorator.png"),
                       width=16.5 * cm, height=10.5 * cm))
    story.append(Paragraph("Figura — Estrutura UML do Decorator aplicado",
                            s["cap"]))

    story.append(Paragraph("Elementos do padrão", s["h3"]))
    story.append(header_table([
        ["Papel GoF", "Implementação na Rede Solidária"],
        ["Component (interface)",
         "DonationRepository — métodos findOne/create/updateStatus"],
        ["ConcreteComponent",
         "PrismaDonationRepository — implementação real sobre o Prisma"],
        ["Decorator (abstract)",
         "DonationRepositoryDecorator — encapsula um inner repository e "
         "delega cada chamada"],
        ["ConcreteDecorators",
         "AuditDecorator (grava AuditLog), TimingDecorator (mede ms), "
         "CacheDecorator (memoiza findOne)"],
    ]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Composição típica", s["h3"]))
    story.append(Preformatted(
        "// Composição da fábrica do módulo Donations\n"
        "const base = new PrismaDonationRepository(prisma);\n"
        "const repo = new AuditDecorator(\n"
        "  new TimingDecorator(\n"
        "    new CacheDecorator(base, { ttlMs: 60_000 }),\n"
        "    new Logger('DonationRepo'),\n"
        "  ),\n"
        "  auditService,\n"
        ");",
        s["code"]))
    story.append(Paragraph(
        "A ordem importa: <b>Cache</b> fica no centro (pega muitos "
        "findOne); <b>Timing</b> mede o caminho inteiro até o cache; "
        "<b>Audit</b> fica por fora porque só interessa registrar a "
        "mutação efetiva.",
        s["body"]))

    story.append(PageBreak())

    story.append(Paragraph("Trecho do AuditDecorator", s["h3"]))
    story.append(Preformatted(
        "export class AuditDecorator extends DonationRepositoryDecorator {\n"
        "  constructor(\n"
        "    inner: DonationRepository,\n"
        "    private readonly audit: AuditService,\n"
        "  ) {\n"
        "    super(inner);\n"
        "  }\n"
        "\n"
        "  async updateStatus(id: string, status: DonationStatus) {\n"
        "    const result = await this.inner.updateStatus(id, status);\n"
        "    await this.audit.log({\n"
        "      action: `donation:${status.toLowerCase()}`,\n"
        "      entity: 'Donation',\n"
        "      entityId: id,\n"
        "    });\n"
        "    return result;\n"
        "  }\n"
        "}",
        s["code"]))

    story.append(Paragraph("Por que Decorator aqui?", s["h3"]))
    motivos = [
        "<b>Responsabilidade única</b>: cada decorador tem uma só razão "
        "para mudar (auditoria, latência, cache).",
        "<b>Open/Closed</b>: para adicionar Retry/CircuitBreaker, escreve "
        "outro decorator — não toca em ninguém.",
        "<b>Combinação em runtime</b>: testes podem montar a pilha sem "
        "AuditDecorator; produção monta com a stack completa.",
    ]
    for m in motivos:
        story.append(Paragraph("•  " + m, s["body"]))

    story.append(Paragraph("Arquivos entregues", s["h3"]))
    story.append(header_table([
        ["Arquivo", "Conteúdo"],
        ["donation.repository.ts",
         "Interface + ConcreteComponent (PrismaDonationRepository)"],
        ["donation-repository-decorator.ts",
         "Decorator abstrato + AuditDecorator + TimingDecorator + "
         "CacheDecorator"],
        ["demo_decorator.ts",
         "Demonstração standalone"],
        ["Padrao_Decorator.pdf / .png", "Diagrama UML"],
        ["Explicacao_Padrao_Decorator.pdf", "Este documento"],
    ]))

    doc.build(story)
    print(f"  -> {out_path}")


# ============================================================
if __name__ == "__main__":
    print("Gerando PDFs dos padrões...")
    build_strategy(os.path.join(
        ROOT, "Tarefas",
        "20-tarefa: Implementar o Padrão Srategy no seu projeto Integrador",
        "Explicacao_Padrao_Strategy.pdf"))
    build_observer(os.path.join(
        ROOT, "Tarefas",
        "26- Tarefa: Projeto de Curricularização e Padrão Observer",
        "Explicacao_Padrao_Observer.pdf"))
    build_decorator(os.path.join(
        ROOT, "Tarefas",
        "30- Tarefa: Projeto de Curricularização -Decorator",
        "Explicacao_Padrao_Decorator.pdf"))
