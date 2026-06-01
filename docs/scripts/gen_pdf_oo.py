"""PDF explicativo da Tarefa 14 — Classes OO."""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                 PageBreak, Table, TableStyle, Preformatted)


ROOT = "/Users/jhonatanrabelo/Documents/Fatec/Eng 3/Projeto/RedeSolid-ria"
T14 = os.path.join(
    ROOT, "Tarefas",
    "14- Entrega da Implementação das classes Orientação a Objetos "
    "herança, polimorfismo e encapsulamento")
OUT = os.path.join(T14, "Explicacao_Classes_OO.pdf")


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
                           leftIndent=4, leading=10,
                           textColor=colors.HexColor("#0f172a"))

    doc = SimpleDocTemplate(OUT, pagesize=A4,
                             leftMargin=2 * cm, rightMargin=2 * cm,
                             topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    s = []

    s.append(Paragraph("Tarefa 14 — Classes OO", h1))
    s.append(Paragraph("Herança · Polimorfismo · Encapsulamento aplicados à "
                        "hierarquia de Usuários da Rede Solidária", h2))
    s.append(Spacer(1, 0.4 * cm))

    s.append(Paragraph("Contexto", h3))
    s.append(Paragraph(
        "A Rede Solidária tem quatro papéis de usuário "
        "(<b>Administrador</b>, <b>Doador</b>, <b>Voluntário</b>, "
        "<b>Recebedor</b>) que compartilham atributos básicos (id, nome, "
        "email, hash da senha, datas) mas diferem nas <b>permissões</b> e "
        "no <b>dashboard</b> de destino. Em vez de espalhar essa lógica "
        "em vários <i>if</i> espalhados pelos services do NestJS, "
        "criamos uma hierarquia de domínio em <b>backend/src/domain/users/</b> "
        "que aplica os três pilares de Orientação a Objetos.",
        body))
    s.append(Spacer(1, 0.2 * cm))

    s.append(Paragraph("1. Herança", h3))
    s.append(Paragraph(
        "A classe abstrata <b>AbstractUser</b> centraliza o estado comum e "
        "os comportamentos compartilhados (<i>block</i>, <i>unblock</i>, "
        "<i>approve</i>, <i>updateProfile</i>, <i>toPublicJSON</i>). "
        "As subclasses <b>Admin</b>, <b>Donor</b>, <b>Volunteer</b> e "
        "<b>Receiver</b> herdam toda essa infraestrutura sem precisar "
        "redefini-la — apenas estendem o comportamento polimórfico onde "
        "necessário.",
        body))
    s.append(Preformatted(
        "abstract class AbstractUser {\n"
        "  // estado comum protegido\n"
        "  protected _isActive: boolean;\n"
        "  ...\n"
        "  // comportamento herdado\n"
        "  block() { ... }\n"
        "  approve() { ... }\n"
        "}\n"
        "\n"
        "class Admin     extends AbstractUser { ... }\n"
        "class Donor     extends AbstractUser { ... }\n"
        "class Volunteer extends AbstractUser { ... }\n"
        "class Receiver  extends AbstractUser { ... }",
        code))

    s.append(Paragraph("2. Polimorfismo", h3))
    s.append(Paragraph(
        "Três membros são <b>abstratos</b> em <i>AbstractUser</i> e "
        "<b>sobrescritos</b> por cada subclasse:",
        body))

    poly = [
        ["Membro", "Sobrescrita em cada subclasse"],
        ["role", "ADMIN, DONOR, VOLUNTEER, RECEIVER"],
        ["canPerform(action)",
         "Cada papel tem sua matriz de ações permitidas. "
         "O Voluntário ainda checa isApproved antes de aceitar entregas."],
        ["getDashboardRoute()",
         "/admin, /donor, /volunteer, /receiver"],
    ]
    t = Table(poly, colWidths=[4.5 * cm, 11.5 * cm])
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
    s.append(Paragraph(
        "Quem consome a entidade (por exemplo, o middleware de "
        "autorização) opera apenas com a referência ao tipo base "
        "<i>AbstractUser</i> e chama <b>user.canPerform(action)</b> — o "
        "TypeScript despacha automaticamente para a sobrescrita correta "
        "(<i>late binding</i>).",
        body))

    s.append(Paragraph("3. Encapsulamento", h3))
    s.append(Paragraph(
        "Todos os campos internos são <b>protected</b> (acessíveis para a "
        "hierarquia) e prefixados com underscore. O mundo externo lê "
        "através de <b>getters</b> e só altera o estado através de "
        "métodos de negócio que validam invariantes:",
        body))
    s.append(Preformatted(
        "block(reason?: string): void {\n"
        "  if (!this._isActive) {\n"
        "    throw new Error(`Usuário ${this._email} já bloqueado`);\n"
        "  }\n"
        "  this._isActive = false;\n"
        "  this._updatedAt = new Date();\n"
        "}",
        code))
    s.append(Paragraph(
        "Assim ninguém consegue colocar <i>isActive=false</i> sem passar "
        "pela regra de não bloquear duas vezes. O hash da senha "
        "(<i>_passwordHash</i>) sai do construtor mas nunca aparece em "
        "<i>toPublicJSON()</i> — protegendo o frontend de vazamentos.",
        body))

    s.append(PageBreak())

    s.append(Paragraph("Integração com o backend NestJS", h2))
    s.append(Paragraph(
        "A hierarquia vive em <b>backend/src/domain/users/user.entity.ts</b> "
        "e é instanciada pelo <b>UserFactory.fromPrisma(record)</b>, que "
        "lê o campo <i>role</i> da linha do PostgreSQL e devolve a "
        "subclasse correta. O <i>UsersService</i> usa o factory nos "
        "endpoints sensíveis:",
        body))
    s.append(Preformatted(
        "async approve(id: string) {\n"
        "  const record = await this.prisma.user.findUnique({ where: { id } });\n"
        "  const domain = UserFactory.fromPrisma(record);\n"
        "  domain.approve();                       // ← regra no domínio\n"
        "  return this.prisma.user.update({\n"
        "    where: { id },\n"
        "    data: { isApproved: true },\n"
        "    select: this.selectFields,\n"
        "  });\n"
        "}\n"
        "\n"
        "async can(id: string, action: Action): Promise<boolean> {\n"
        "  const record = await this.prisma.user.findUnique({ where: { id } });\n"
        "  if (!record) return false;\n"
        "  return UserFactory.fromPrisma(record).canPerform(action);\n"
        "}",
        code))

    s.append(Paragraph("Saída da demo (demo_usuarios.ts)", h3))
    s.append(Paragraph(
        "Rodando <b>npx ts-node demo_usuarios.ts</b> obtemos o seguinte "
        "(matriz reduzida para 5 ações):",
        body))
    s.append(Preformatted(
        "role        donation:create  donation:reserve  delivery:accept  review:write  admin:dashboard\n"
        "ADMIN          ✓                ✗                ✗               ✓             ✓\n"
        "DONOR          ✓                ✗                ✗               ✓             ✗\n"
        "VOLUNTEER      ✗                ✗                ✗               ✓             ✗   (Ana ainda não aprovada)\n"
        "RECEIVER       ✗                ✓                ✗               ✓             ✗\n"
        "\n"
        "Após anaPendente.approve():\n"
        "Ana (voluntária) pode aceitar entrega? true",
        code))

    s.append(Paragraph("Arquivos entregues", h3))
    arq = [
        ["Arquivo", "Conteúdo"],
        ["user.entity.ts",
         "Hierarquia integrada ao backend (mesma versão de backend/src/domain/users/)"],
        ["demo_usuarios.ts",
         "Demonstração standalone — não depende de Prisma. Rode com ts-node."],
        ["Explicacao_Classes_OO.pdf",
         "Este documento."],
    ]
    t = Table(arq, colWidths=[5.5 * cm, 10.5 * cm])
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
    print("Gerando Explicacao_Classes_OO.pdf...")
    build()
