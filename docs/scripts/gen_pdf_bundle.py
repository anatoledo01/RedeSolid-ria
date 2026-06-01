"""PDF capa/índice da Tarefa 38 — bundle da 1ª versão."""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image,
                                 PageBreak, Table, TableStyle, Preformatted)


ROOT = "/Users/jhonatanrabelo/Documents/Fatec/Eng 3/Projeto/RedeSolid-ria"
T38 = os.path.join(ROOT, "Tarefas",
                    "38- Entrega dos Artefatos do Projeto de Curricularização 1-Versão")
DIAG = os.path.join(ROOT, "docs", "diagramas")
OUT = os.path.join(T38, "00_Capa_Indice_1a_Versao.pdf")


def build():
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Heading1"],
                         textColor=colors.HexColor("#1f3a5f"),
                         spaceAfter=12, fontSize=22, alignment=TA_CENTER)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"],
                         textColor=colors.HexColor("#1f3a5f"),
                         spaceAfter=8, fontSize=14)
    h3 = ParagraphStyle("h3", parent=styles["Heading3"],
                         textColor=colors.HexColor("#10b981"),
                         spaceAfter=6, fontSize=12)
    body = ParagraphStyle("body", parent=styles["BodyText"],
                            alignment=TA_JUSTIFY, fontSize=10,
                            spaceAfter=6, leading=14)
    cap = ParagraphStyle("cap", parent=styles["Italic"],
                          alignment=TA_CENTER, fontSize=9,
                          textColor=colors.HexColor("#475569"))
    center = ParagraphStyle("c", parent=styles["BodyText"],
                              alignment=TA_CENTER, fontSize=11)
    code = ParagraphStyle("code", parent=styles["Code"], fontSize=8,
                           leftIndent=4, leading=10)

    doc = SimpleDocTemplate(OUT, pagesize=A4,
                             leftMargin=2 * cm, rightMargin=2 * cm,
                             topMargin=2 * cm, bottomMargin=1.5 * cm)
    s = []

    # ============ CAPA ============
    s.append(Spacer(1, 3 * cm))
    s.append(Paragraph("Rede Solidária", h1))
    s.append(Paragraph(
        "Gerenciador de Doações — 1ª Versão dos Artefatos", h2))
    s.append(Spacer(1, 0.5 * cm))
    s.append(Paragraph("Projeto de Curricularização — "
                        "Engenharia de Software III", center))
    s.append(Spacer(1, 2.5 * cm))

    meta = [
        ["Parceiro externo", "Cidade Social de Mogi (Mogi das Cruzes — SP)"],
        ["Stakeholder", "Jonas Oliveira"],
        ["Equipe", "Jhonatan Rabelo"],
        ["", "Vitor Campos"],
        ["", "Ana Toledo"],
        ["", "Edilson Junior"],
        ["Data de fechamento", "Junho/2026 (Quinzena 4)"],
    ]
    t = Table(meta, colWidths=[5 * cm, 11 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#1f3a5f")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
    ]))
    s.append(t)

    s.append(PageBreak())

    # ============ RESUMO ============
    s.append(Paragraph("1. Resumo do Projeto", h2))
    s.append(Paragraph(
        "A <b>Rede Solidária</b> é uma plataforma full-stack de gestão de "
        "doações construída no contexto do Projeto de Curricularização da "
        "disciplina <b>Engenharia de Software III</b>. Foi desenvolvida em "
        "parceria com a <b>Cidade Social de Mogi</b>, ONG que distribui "
        "cestas básicas e atualmente carece de organização para controlar "
        "validade de produtos, cadastrar doadores/donatários (com CPF) e "
        "rastrear cada cesta entregue.",
        body))
    s.append(Paragraph(
        "Esta entrega consolida a <b>1ª versão</b> dos artefatos do "
        "projeto: modelagem do sistema (IDEF0, Casos de Uso, DFD, DER), "
        "implementação OO da hierarquia de usuários, aplicação dos "
        "padrões <b>Strategy</b>, <b>Observer</b> e <b>Decorator</b> "
        "diretamente sobre o backend NestJS, e o respectivo diagrama de "
        "classes.",
        body))

    s.append(Paragraph("2. Stack Tecnológica", h3))
    stack = [
        ["Camada", "Tecnologia"],
        ["Frontend",   "Next.js 15 · React 19 · TypeScript · TailwindCSS v4 · "
                       "Zustand · React Query · Framer Motion"],
        ["Backend",    "NestJS 11 · TypeScript · Prisma ORM 6 · JWT (Passport) · "
                       "Helmet · Throttler · Swagger/OpenAPI"],
        ["Banco",      "PostgreSQL 16 (Docker Compose, porta 5433)"],
        ["Dev Tools",  "Docker · npm · ts-node · ESLint"],
    ]
    t = Table(stack, colWidths=[3.5 * cm, 12.5 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f3a5f")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    s.append(t)
    s.append(Spacer(1, 0.3 * cm))

    s.append(Paragraph("3. Como executar o projeto", h3))
    s.append(Preformatted(
        "# 1. Subir o banco\n"
        "docker compose up -d\n"
        "\n"
        "# 2. Backend (porta 3001)\n"
        "cd backend\n"
        "npm install\n"
        "npx prisma db push\n"
        "npm run prisma:seed\n"
        "npm run dev\n"
        "\n"
        "# 3. Frontend (porta 3000)\n"
        "cd ../frontend\n"
        "npm install\n"
        "npm run dev\n"
        "\n"
        "# Swagger:  http://localhost:3001/api/docs\n"
        "# Frontend: http://localhost:3000",
        code))

    s.append(PageBreak())

    # ============ ÍNDICE DOS ARTEFATOS ============
    s.append(Paragraph("4. Índice dos Artefatos Entregues", h2))
    s.append(Paragraph(
        "Cada item abaixo corresponde a uma das oito tarefas do plano de "
        "ação. Os arquivos vivem nesta pasta (Tarefa 38) e estão também "
        "replicados nas pastas individuais (Tarefas 9, 14, 15, 17, 20, "
        "26, 30).",
        body))

    art = [
        ["Pasta", "Tarefa", "Arquivos principais"],
        ["09_Diagramas_Modelagem/",
         "Diagramas: IDEF0 N0+N1, Casos de Uso, DFD, DER",
         "IDEF0_N0.pdf  IDEF0_N1.pdf  CasosDeUso.pdf  DFD.pdf  DER.pdf "
         " Explicacao_Diagramas.pdf"],
        ["14_Classes_OO/",
         "Hierarquia OO de Usuários",
         "user.entity.ts  demo_usuarios.ts  Explicacao_Classes_OO.pdf"],
        ["17_Diagrama_Classes/",
         "Diagrama UML de classes",
         "DiagramaClasses.pdf  user.entity.ts  "
         "Explicacao_Diagrama_Classes.pdf"],
        ["20_Strategy/",
         "Padrão Strategy aplicado a notificações",
         "notification.strategy.ts  demo_strategy.ts  "
         "Padrao_Strategy.pdf  Explicacao_Padrao_Strategy.pdf"],
        ["26_Observer/",
         "Padrão Observer aplicado a eventos de doação",
         "donation-event-bus.ts  demo_observer.ts  "
         "Padrao_Observer.pdf  Explicacao_Padrao_Observer.pdf"],
        ["30_Decorator/",
         "Padrão Decorator aplicado ao repositório",
         "donation-repository.ts  demo_decorator.ts  "
         "Padrao_Decorator.pdf  Explicacao_Padrao_Decorator.pdf"],
    ]
    t = Table(art, colWidths=[3.6 * cm, 4.2 * cm, 8.2 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#10b981")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    s.append(t)

    s.append(PageBreak())

    # ============ Mapa do código ============
    s.append(Paragraph("5. Mapa do código (camada de domínio)", h2))
    s.append(Paragraph(
        "Toda a parte didática (OO + Strategy + Observer + Decorator) foi "
        "concentrada em <b>backend/src/domain/</b>, separada das "
        "infraestruturas Prisma/NestJS. Isso facilita rastrear o que é "
        "domínio puro (testável sem rede) e o que é framework.",
        body))
    s.append(Preformatted(
        "backend/src/\n"
        "├── domain/\n"
        "│   ├── users/\n"
        "│   │   └── user.entity.ts          ← Tarefas 14 e 17 (OO + UML)\n"
        "│   ├── notifications/\n"
        "│   │   └── notification.strategy.ts ← Tarefa 20 (Strategy)\n"
        "│   ├── events/\n"
        "│   │   └── donation-event-bus.ts    ← Tarefa 26 (Observer)\n"
        "│   └── decorators/\n"
        "│       └── donation-repository.ts   ← Tarefa 30 (Decorator)\n"
        "├── modules/\n"
        "│   ├── users/users.service.ts       ← consome UserFactory\n"
        "│   └── donations/donations.service.ts ← consome notifier + bus\n"
        "└── prisma/...",
        code))

    s.append(Paragraph("6. Próximos passos (Quinzena 5+)", h3))
    nexts = [
        "Implementar o <b>UploadsModule</b> (atualmente removido) para "
        "habilitar o upload real de fotos das doações.",
        "Adicionar a regra de <b>validade dos produtos</b> no schema "
        "Donation (campo <i>expiresAt</i>) e exibi-la no dashboard com "
        "alerta visual — atende a necessidade da Cidade Social.",
        "Estender o <b>cadastro de donatários</b> com CPF e endereço "
        "obrigatórios (atualmente o schema já tem Address, falta "
        "campo CPF em User).",
        "Substituir <i>ConsoleNotificationStrategy</i> por "
        "<i>EmailNotificationStrategy</i> integrada a um provedor real "
        "(SendGrid / Amazon SES).",
        "Plugar o <b>DonationRepositoryDecorator</b> ao DonationsService "
        "via injeção de dependência (factory provider do NestJS).",
    ]
    for n in nexts:
        s.append(Paragraph("•  " + n, body))

    doc.build(s)
    print(f"  -> {OUT}")


if __name__ == "__main__":
    print("Gerando 00_Capa_Indice_1a_Versao.pdf...")
    build()
