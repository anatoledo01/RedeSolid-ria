"""Gera o PDF explicativo dos 5 diagramas (Tarefa 9/15)."""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image,
                                 PageBreak, Table, TableStyle)


ROOT = "/Users/jhonatanrabelo/Documents/Fatec/Eng 3/Projeto/RedeSolid-ria"
DIAG = os.path.join(ROOT, "docs", "diagramas")
OUT = os.path.join(DIAG, "Explicacao_Diagramas.pdf")


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
    caption = ParagraphStyle("cap", parent=styles["Italic"],
                              alignment=TA_CENTER, fontSize=9,
                              textColor=colors.HexColor("#475569"))

    doc = SimpleDocTemplate(OUT, pagesize=A4,
                             leftMargin=2 * cm, rightMargin=2 * cm,
                             topMargin=1.5 * cm, bottomMargin=1.5 * cm)

    story = []

    # Capa
    story.append(Paragraph("Rede Solidária", h1))
    story.append(Paragraph("Modelagem do Sistema: IDEF0, Casos de Uso, "
                            "DFD e DER", h2))
    story.append(Spacer(1, 0.5 * cm))

    meta = [
        ["Disciplina:", "Engenharia de Software III"],
        ["Trabalho:", "Projeto de Curricularização — Gerenciador de Doações"],
        ["Parceiro externo:", "Cidade Social de Mogi (Mogi das Cruzes — SP)"],
        ["Stakeholder:", "Jonas Oliveira"],
        ["Equipe:", "Jhonatan Rabelo · Vitor Campos · Ana Toledo · Edilson Junior"],
        ["Período:", "1ª versão dos artefatos — Quinzenas 1 a 4"],
    ]
    t = Table(meta, colWidths=[4.5 * cm, 11.5 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#1f3a5f")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.7 * cm))

    story.append(Paragraph("Resumo do contexto", h3))
    story.append(Paragraph(
        "A Rede Solidária é uma plataforma de gestão de doações que conecta "
        "<b>doadores</b>, <b>recebedores</b> (donatários) e <b>voluntários</b>, "
        "supervisionados por um <b>administrador</b>. O objetivo central é "
        "organizar e listar os produtos doados, com rastreabilidade do item "
        "desde a publicação até a entrega final, atendendo a demanda real da "
        "ONG Cidade Social de Mogi por controle de estoque, validade dos "
        "produtos e registro completo de doadores e donatários.",
        body))
    story.append(Paragraph(
        "Este documento descreve os cinco artefatos de modelagem do sistema "
        "exigidos na disciplina: <b>IDEF0 nível 0 (contexto)</b>, "
        "<b>IDEF0 nível 1 (decomposição)</b>, <b>Diagrama de Casos de Uso</b>, "
        "<b>DFD de Nível 1</b> e <b>DER</b>. Cada artefato está disponível em "
        "formato PDF e PNG na pasta <i>docs/diagramas/</i>.",
        body))

    story.append(PageBreak())

    # ===== IDEF0 N0 =====
    story.append(Paragraph("1. IDEF0 — Nível 0 (Contexto A-0)", h2))
    story.append(Paragraph(
        "O IDEF0 de nível 0 apresenta o sistema como uma <b>função única</b> "
        "(<i>Gerenciar Plataforma Rede Solidária</i>), descrevendo o que "
        "<b>entra</b>, o que <b>sai</b>, quais <b>controles</b> regem a "
        "operação e quais <b>mecanismos</b> a executam (notação ICOM).",
        body))
    story.append(Image(os.path.join(DIAG, "IDEF0_N0.png"),
                       width=16.5 * cm, height=11.5 * cm))
    story.append(Paragraph("Figura 1 — IDEF0 N0: contexto do sistema",
                            caption))
    story.append(Paragraph("Pontos-chave:", h3))
    bullets = [
        "<b>Entradas:</b> itens disponíveis, necessidades de recebedores, "
        "disponibilidade de voluntários e dados de cadastro.",
        "<b>Controles:</b> LGPD, regras de negócio (estados das doações e "
        "papéis), política de aprovação pelo administrador e termos de uso.",
        "<b>Saídas:</b> doações entregues, avaliações, relatórios CSV, "
        "logs de auditoria e métricas de impacto social.",
        "<b>Mecanismos:</b> usuários humanos, Frontend Next.js, Backend "
        "NestJS e Prisma ORM sobre PostgreSQL 16.",
    ]
    for b in bullets:
        story.append(Paragraph("•  " + b, body))

    story.append(PageBreak())

    # ===== IDEF0 N1 =====
    story.append(Paragraph("2. IDEF0 — Nível 1 (Decomposição A0)", h2))
    story.append(Paragraph(
        "A função A0 é decomposta em cinco subfunções, cada uma mapeada para "
        "um conjunto de módulos NestJS do backend. As setas representam a "
        "transferência de informação entre as atividades — o ‘token JWT’ "
        "produzido por A1 alimenta as demais, o ‘doação reservada’ produz "
        "demanda para A3, e os ‘eventos do sistema’ são consolidados por A5 "
        "na forma de relatórios e auditoria.",
        body))
    story.append(Image(os.path.join(DIAG, "IDEF0_N1.png"),
                       width=16.5 * cm, height=11.5 * cm))
    story.append(Paragraph("Figura 2 — IDEF0 N1: decomposição em 5 "
                            "subatividades", caption))
    story.append(Paragraph("Subatividades:", h3))
    activities = [
        ("A1", "Gerenciar Usuários e Autenticação",
         "AuthModule + UsersModule (cadastro, login, refresh, RBAC, aprovação "
         "de voluntários)"),
        ("A2", "Gerenciar Catálogo de Doações",
         "DonationsModule + CategoriesModule (CRUD da doação, busca, fotos, "
         "categorias)"),
        ("A3", "Coordenar Entregas",
         "DeliveriesModule (voluntário aceita doação reservada e atualiza o "
         "ciclo de entrega)"),
        ("A4", "Avaliar Transações",
         "ReviewsModule (notas e comentários após a entrega)"),
        ("A5", "Administrar & Auditar",
         "AdminModule + AuditLog (dashboard, exportação CSV e trilha de "
         "auditoria de todas as ações sensíveis)"),
    ]
    t = Table([["ID", "Subatividade", "Implementação"]] +
              [list(a) for a in activities],
              colWidths=[1.2 * cm, 5.5 * cm, 9.0 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f3a5f")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t)

    story.append(PageBreak())

    # ===== Casos de Uso =====
    story.append(Paragraph("3. Diagrama de Casos de Uso", h2))
    story.append(Paragraph(
        "O diagrama UML de casos de uso identifica os quatro atores do "
        "sistema (Doador, Recebedor, Voluntário e Administrador) e as "
        "interações principais. Casos de uso comuns ficam no painel central "
        "azul; casos de uso restritos ao administrador ficam no painel "
        "lateral âmbar.",
        body))
    story.append(Image(os.path.join(DIAG, "CasosDeUso.png"),
                       width=16.5 * cm, height=11.0 * cm))
    story.append(Paragraph("Figura 3 — Casos de Uso do sistema", caption))
    story.append(Paragraph("Relações estereotipadas:", h3))
    rels = [
        "<b>«include»</b> entre <i>Publicar doação</i> e <i>Anexar fotos</i> — "
        "a publicação obrigatoriamente envolve o upload das imagens do item.",
        "<b>«include»</b> entre <i>Aceitar entrega</i> e <i>Atualizar status "
        "da entrega</i> — toda entrega aceita passa pelos estados ACCEPTED "
        "→ IN_TRANSIT → DELIVERED.",
        "<b>«extend»</b> entre <i>Reservar doação</i> e <i>Aceitar entrega</i> "
        "— a reserva é gatilho que permite a abertura de uma delivery request "
        "por um voluntário.",
    ]
    for r in rels:
        story.append(Paragraph("•  " + r, body))

    story.append(PageBreak())

    # ===== DFD =====
    story.append(Paragraph("4. DFD — Nível 1", h2))
    story.append(Paragraph(
        "O DFD descreve o fluxo de informação entre as entidades externas "
        "(atores), os processos de negócio (P1–P6) e os depósitos de dados "
        "(D1–D5). Adotamos a notação Gane &amp; Sarson: entidades em "
        "retângulos âmbar com sombra, processos em retângulos arredondados "
        "verdes (numerados) e depósitos em retângulos azuis com etiqueta "
        "lateral.",
        body))
    story.append(Image(os.path.join(DIAG, "DFD.png"),
                       width=16.5 * cm, height=11.0 * cm))
    story.append(Paragraph("Figura 4 — DFD Nível 1", caption))
    story.append(Paragraph("Mapeamento:", h3))
    procs = [
        ("P1", "Autenticar & Gerenciar Usuários", "D1 (Usuários)"),
        ("P2", "Publicar & Cadastrar Doação", "D2 (Doações + Categorias)"),
        ("P3", "Reservar & Buscar Doação", "D2 (Doações + Categorias)"),
        ("P4", "Coordenar Entrega", "D3 (Entregas + Endereços)"),
        ("P5", "Avaliar Transação", "D4 (Reviews)"),
        ("P6", "Administrar & Auditar",
         "D5 (AuditLog); leitura agregada de D1–D4"),
    ]
    t = Table([["ID", "Processo", "Depósito principal"]] +
              [list(p) for p in procs],
              colWidths=[1.2 * cm, 7.8 * cm, 6.7 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#10b981")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cccccc")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t)

    story.append(PageBreak())

    # ===== DER =====
    story.append(Paragraph("5. DER — Modelo Entidade-Relacionamento", h2))
    story.append(Paragraph(
        "O DER traduz o <b>schema.prisma</b> em uma visão lógica de "
        "entidades e relacionamentos. O banco está modelado em PostgreSQL 16. "
        "Há nove entidades, com a entidade <i>User</i> servindo como hub "
        "central — todos os papéis do sistema (ADMIN, DONOR, VOLUNTEER, "
        "RECEIVER) compartilham essa tabela, diferenciando-se pelo campo "
        "<i>role</i>.",
        body))
    story.append(Image(os.path.join(DIAG, "DER.png"),
                       width=16.5 * cm, height=11.0 * cm))
    story.append(Paragraph("Figura 5 — DER do sistema", caption))
    story.append(Paragraph("Decisões de modelagem:", h3))
    notes = [
        "<b>UUID como PK:</b> todas as entidades usam <i>id uuid</i> "
        "(função <code>uuid()</code> do Prisma) para evitar colisões e "
        "facilitar integração externa.",
        "<b>Soft-flags em User:</b> <i>isApproved</i> diferencia voluntários "
        "que ainda aguardam o aval do administrador; <i>isActive</i> permite "
        "bloqueio sem deletar o histórico do usuário.",
        "<b>Status enum em Donation/DeliveryRequest:</b> a evolução de "
        "estados (AVAILABLE → RESERVED → IN_TRANSIT → DELIVERED) é controlada "
        "no domínio e auditada por AuditLog.",
        "<b>Auto-relacionamento via Review:</b> a entidade Review aponta "
        "duas vezes para User (<i>author</i> e <i>target</i>), implementando "
        "reputação cruzada entre doadores e recebedores.",
        "<b>Cascade on delete:</b> DonationImage, Address e RefreshToken "
        "definem <i>onDelete: Cascade</i> para evitar registros órfãos quando "
        "o usuário/doação é excluído.",
    ]
    for n in notes:
        story.append(Paragraph("•  " + n, body))

    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(
        "<b>Arquivo-fonte:</b> backend/prisma/schema.prisma — sincronizado "
        "com o banco via <code>npx prisma db push</code> e populado com "
        "<code>npm run prisma:seed</code>.", body))

    doc.build(story)
    print(f"  -> {OUT}")


if __name__ == "__main__":
    print("Gerando Explicacao_Diagramas.pdf...")
    build()
