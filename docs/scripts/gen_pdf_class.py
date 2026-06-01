"""PDF da Tarefa 17 — Diagrama de classe + implementação."""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image,
                                 PageBreak, Table, TableStyle, Preformatted)


ROOT = "/Users/jhonatanrabelo/Documents/Fatec/Eng 3/Projeto/RedeSolid-ria"
T17 = os.path.join(ROOT, "Tarefas",
                    "17- Tarefa: Criar o diagrama de classe e implementação")
DIAG = os.path.join(ROOT, "docs", "diagramas")
OUT = os.path.join(T17, "Explicacao_Diagrama_Classes.pdf")


def build():
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Heading1"],
                         textColor=colors.HexColor("#1f3a5f"),
                         spaceAfter=12, fontSize=18)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"],
                         textColor=colors.HexColor("#1f3a5f"),
                         spaceAfter=8, fontSize=14)
    h3 = ParagraphStyle("h3", parent=styles["Heading3"],
                         textColor=colors.HexColor("#10b981"),
                         spaceAfter=6, fontSize=12)
    body = ParagraphStyle("body", parent=styles["BodyText"],
                            alignment=TA_JUSTIFY, fontSize=10,
                            spaceAfter=6, leading=14)
    code = ParagraphStyle("code", parent=styles["Code"], fontSize=8,
                           leftIndent=4, leading=10)
    cap = ParagraphStyle("cap", parent=styles["Italic"],
                          alignment=TA_CENTER, fontSize=9,
                          textColor=colors.HexColor("#475569"))

    doc = SimpleDocTemplate(OUT, pagesize=A4,
                             leftMargin=2 * cm, rightMargin=2 * cm,
                             topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    s = []

    s.append(Paragraph("Tarefa 17 — Diagrama de Classes", h1))
    s.append(Paragraph(
        "Domínio de Usuários da Rede Solidária", h2))
    s.append(Spacer(1, 0.4 * cm))

    s.append(Paragraph("Visão geral", h3))
    s.append(Paragraph(
        "O diagrama abaixo apresenta a estrutura UML do pacote "
        "<b>backend/src/domain/users/</b>, que materializa a hierarquia "
        "de papéis (Admin, Donor, Volunteer, Receiver) descrita na Tarefa "
        "14. Inclui também a <b>UserFactory</b> que faz a ponte entre o "
        "registro relacional (PostgreSQL via Prisma) e o objeto de "
        "domínio polimórfico, e o serviço <b>UsersService</b> do NestJS "
        "como cliente.",
        body))

    s.append(Image(os.path.join(DIAG, "DiagramaClasses.png"),
                   width=16.5 * cm, height=11.5 * cm))
    s.append(Paragraph("Figura — Diagrama de Classes (UML 2)", cap))
    s.append(Spacer(1, 0.2 * cm))

    s.append(Paragraph("Elementos do diagrama", h3))
    elements = [
        ["Elemento", "Tipo", "Papel"],
        ["AbstractUser", "Classe abstrata",
         "Centraliza estado e comportamento herdável; expõe três membros "
         "abstratos sobrescritos pelas subclasses."],
        ["Admin · Donor · Volunteer · Receiver",
         "Classes concretas",
         "Implementam role, canPerform(action) e getDashboardRoute(). "
         "Volunteer adiciona a regra extra de isApproved."],
        ["UserFactory", "«factory» (classe utilitária)",
         "fromPrisma(record) faz o switch no campo role e devolve a "
         "subclasse correta de AbstractUser."],
        ["Action", "«union type»",
         "Conjunto fechado de strings literais que representam ações do "
         "sistema. Usado pelo canPerform()."],
        ["UsersService", "«injectable» NestJS",
         "Cliente da hierarquia — chama UserFactory.fromPrisma() em "
         "approve(), block() e can()."],
    ]
    t = Table(elements, colWidths=[5 * cm, 4 * cm, 7 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f3a5f")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    s.append(t)

    s.append(PageBreak())

    s.append(Paragraph("Relacionamentos", h3))
    rels = [
        "<b>Herança (linha + triângulo vazio)</b>: Admin, Donor, "
        "Volunteer e Receiver herdam de AbstractUser. Como "
        "AbstractUser é abstrata, ela só existe na forma de uma de suas "
        "subclasses concretas em tempo de execução.",
        "<b>Dependência (linha tracejada → «uses»)</b>: UserFactory "
        "instancia AbstractUser; UsersService usa UserFactory para "
        "hidratar o domínio; canPerform consome o union type Action.",
        "<b>Sem associações <i>bidirecionais</i></b>: o domínio não "
        "guarda referência ao serviço — é um cidadão puro do modelo, "
        "testável de forma isolada (ver demo_usuarios.ts).",
    ]
    for r in rels:
        s.append(Paragraph("•  " + r, body))

    s.append(Paragraph("Mapeamento código ↔ diagrama", h3))
    mapping = [
        ["Classe no diagrama", "Arquivo no backend"],
        ["AbstractUser, Admin, Donor, Volunteer, Receiver, UserFactory, Action",
         "backend/src/domain/users/user.entity.ts"],
        ["UsersService", "backend/src/modules/users/users.service.ts"],
    ]
    t = Table(mapping, colWidths=[7.5 * cm, 8.5 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#10b981")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    s.append(t)
    s.append(Spacer(1, 0.4 * cm))

    s.append(Paragraph("Por que separar domínio dos services?", h3))
    s.append(Paragraph(
        "O NestJS por si só nos dá uma arquitetura em camadas "
        "(controller → service → repository) mas <b>não nos força a ter "
        "um domínio rico</b>. Manter a hierarquia de usuários como "
        "classes puras (sem dependência de Prisma ou NestJS) traz três "
        "ganhos:",
        body))
    gains = [
        "<b>Testabilidade</b>: cada subclasse pode ser instanciada e "
        "testada sem precisar do banco — basta passar UserProps.",
        "<b>Regras de negócio no lugar certo</b>: a regra "
        "<i>“voluntário não aprovado não aceita entrega”</i> mora na "
        "classe Volunteer, não em um if escondido em algum service.",
        "<b>Polimorfismo a favor da clareza</b>: chamar "
        "<code>user.canPerform('delivery:accept')</code> resolve sozinho "
        "qual a regra correta para o papel — sem switch espalhado no "
        "código.",
    ]
    for g in gains:
        s.append(Paragraph("•  " + g, body))

    s.append(Paragraph("Implementação — trecho relevante", h3))
    s.append(Preformatted(
        "abstract class AbstractUser {\n"
        "  protected _isActive: boolean;\n"
        "  abstract canPerform(action: Action): boolean;\n"
        "  block() { /* ... */ this._isActive = false; }\n"
        "}\n"
        "\n"
        "class Volunteer extends AbstractUser {\n"
        "  get role(): Role { return Role.VOLUNTEER; }\n"
        "  canPerform(action: Action): boolean {\n"
        "    if (!this._isActive) return false;\n"
        "    if (!this._isApproved && action === 'delivery:accept')\n"
        "      return false;\n"
        "    return ['delivery:accept', 'delivery:update-status',\n"
        "            'review:write'].includes(action);\n"
        "  }\n"
        "}",
        code))

    s.append(Paragraph("Arquivos entregues", h3))
    arq = [
        ["Arquivo", "Conteúdo"],
        ["DiagramaClasses.pdf / .png",
         "O diagrama UML (formato A3 paisagem)."],
        ["user.entity.ts",
         "Implementação TypeScript completa da hierarquia."],
        ["Explicacao_Diagrama_Classes.pdf",
         "Este documento."],
    ]
    t = Table(arq, colWidths=[6 * cm, 10 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#10b981")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    s.append(t)

    doc.build(s)
    print(f"  -> {OUT}")


if __name__ == "__main__":
    print("Gerando Explicacao_Diagrama_Classes.pdf...")
    build()
