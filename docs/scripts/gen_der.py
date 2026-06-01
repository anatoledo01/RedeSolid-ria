"""Gera o DER (Diagrama Entidade–Relacionamento) baseado no schema.prisma."""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from _common import *


def entity(ax, x, y, w, h, name, attrs, pk_attr, fks=None):
    fks = fks or []
    # Cabeçalho
    ax.add_patch(Rectangle((x, y + h - 2.4), w, 2.4,
                           facecolor=PALETTE["primary"],
                           edgecolor=PALETTE["primary"]))
    ax.text(x + w / 2, y + h - 1.2, name,
            fontsize=10, fontweight="bold", ha="center",
            va="center", color="white")
    # Corpo
    ax.add_patch(Rectangle((x, y), w, h - 2.4, fill=True,
                           facecolor="white",
                           edgecolor=PALETTE["primary"], lw=1.2))
    # PK
    ax.text(x + 0.3, y + h - 3.4, f"PK  {pk_attr}",
            fontsize=7.2, va="center", color=PALETTE["primary"],
            fontweight="bold")
    ax.plot([x + 0.2, x + w - 0.2], [y + h - 4.0, y + h - 4.0],
            color="#cccccc", lw=0.4)
    # Atributos
    for i, a in enumerate(attrs):
        ay = y + h - 4.7 - i * 0.95
        if ay < y + 0.4:
            break
        prefix = "FK " if a in fks else "·  "
        color = PALETTE["accent"] if a in fks else PALETTE["text"]
        weight = "bold" if a in fks else "normal"
        ax.text(x + 0.3, ay, f"{prefix} {a}", fontsize=6.5, va="center",
                color=color, fontweight=weight)


def conn(ax, x1, y1, x2, y2, c_left, c_right, name=None,
         curved=False, rad=0.0, label_offset=(0, 0)):
    if curved:
        ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2),
                                      arrowstyle="-", mutation_scale=10,
                                      color=PALETTE["neutral"], lw=1.0,
                                      connectionstyle=f"arc3,rad={rad}"))
    else:
        ax.plot([x1, x2], [y1, y2], color=PALETTE["neutral"], lw=1.0)
    # cardinalidades nas pontas
    ax.text(x1, y1, c_left, fontsize=7.5, ha="center", va="center",
            color=PALETTE["danger"], fontweight="bold",
            bbox=dict(facecolor="white", edgecolor=PALETTE["danger"],
                      boxstyle="round,pad=0.15", lw=0.5))
    ax.text(x2, y2, c_right, fontsize=7.5, ha="center", va="center",
            color=PALETTE["danger"], fontweight="bold",
            bbox=dict(facecolor="white", edgecolor=PALETTE["danger"],
                      boxstyle="round,pad=0.15", lw=0.5))
    if name:
        mx = (x1 + x2) / 2 + label_offset[0]
        my = (y1 + y2) / 2 + label_offset[1]
        ax.text(mx, my, name, fontsize=6.6, ha="center", va="center",
                color=PALETTE["neutral"], style="italic",
                bbox=dict(facecolor="white", edgecolor="none", pad=0.5))


def gen():
    fig, ax = new_figure("A3", "DER",
                         "DER — Modelo Entidade–Relacionamento",
                         "DER-01")

    # ===== TOPO: User (centralizado) =====
    user_x, user_y, user_w, user_h = 42, 47, 16, 16
    entity(ax, user_x, user_y, user_w, user_h, "User", [
        "name",
        "email (unique)",
        "password (hash)",
        "role",
        "phone",
        "avatar",
        "isApproved",
        "isActive",
        "createdAt",
        "updatedAt",
    ], pk_attr="id  (uuid)")
    ax.text(user_x + user_w / 2, user_y - 0.8,
            "role ∈ {ADMIN, DONOR, VOLUNTEER, RECEIVER}",
            fontsize=6.5, ha="center", va="top",
            color=PALETTE["neutral"], style="italic")

    # ===== LINHA DO MEIO: Donation, DeliveryRequest, Review =====
    don_x, don_y, don_w, don_h = 7, 26, 16, 16
    entity(ax, don_x, don_y, don_w, don_h, "Donation", [
        "title",
        "description",
        "quantity",
        "status",
        "locationText",
        "donorId",
        "receiverId",
        "categoryId",
        "createdAt",
        "updatedAt",
    ], pk_attr="id  (uuid)",
        fks=["donorId", "receiverId", "categoryId"])
    ax.text(don_x + don_w / 2, don_y - 0.8,
            "status ∈ {AVAILABLE, RESERVED, IN_TRANSIT, DELIVERED, CANCELLED}",
            fontsize=6.0, ha="center", va="top",
            color=PALETTE["neutral"], style="italic")

    dr_x, dr_y, dr_w, dr_h = 42, 26, 16, 16
    entity(ax, dr_x, dr_y, dr_w, dr_h, "DeliveryRequest", [
        "status",
        "notes",
        "acceptedAt",
        "deliveredAt",
        "donationId",
        "volunteerId",
        "createdAt",
        "updatedAt",
    ], pk_attr="id  (uuid)", fks=["donationId", "volunteerId"])
    ax.text(dr_x + dr_w / 2, dr_y - 0.8,
            "status ∈ {PENDING, ACCEPTED, IN_TRANSIT, DELIVERED, CANCELLED}",
            fontsize=6.0, ha="center", va="top",
            color=PALETTE["neutral"], style="italic")

    rv_x, rv_y, rv_w, rv_h = 77, 26, 16, 16
    entity(ax, rv_x, rv_y, rv_w, rv_h, "Review", [
        "rating (1–5)",
        "comment",
        "authorId",
        "targetId",
        "donationId",
        "createdAt",
    ], pk_attr="id  (uuid)",
        fks=["authorId", "targetId", "donationId"])

    # ===== BASE: entidades leaf =====
    leaf_y, leaf_h = 7, 13
    cat_x, cat_w = 3, 13
    entity(ax, cat_x, leaf_y, cat_w, leaf_h, "Category", [
        "name (unique)",
        "description",
        "icon",
        "isActive",
        "createdAt",
    ], pk_attr="id  (uuid)")

    img_x, img_w = 20, 13
    entity(ax, img_x, leaf_y, img_w, leaf_h, "DonationImage", [
        "url",
        "filename",
        "donationId",
        "createdAt",
    ], pk_attr="id  (uuid)", fks=["donationId"])

    addr_x, addr_w = 37, 13
    entity(ax, addr_x, leaf_y, addr_w, leaf_h, "Address", [
        "street",
        "city / state",
        "zipCode",
        "complement",
        "isDefault",
        "userId",
    ], pk_attr="id  (uuid)", fks=["userId"])

    rt_x, rt_w = 54, 13
    entity(ax, rt_x, leaf_y, rt_w, leaf_h, "RefreshToken", [
        "token (unique)",
        "expiresAt",
        "isRevoked",
        "userId",
        "createdAt",
    ], pk_attr="id  (uuid)", fks=["userId"])

    log_x, log_w = 71, 13
    entity(ax, log_x, leaf_y, log_w, leaf_h, "AuditLog", [
        "action",
        "entity",
        "entityId",
        "details (json)",
        "ipAddress",
        "userId",
        "createdAt",
    ], pk_attr="id  (uuid)", fks=["userId"])

    # ===== RELACIONAMENTOS =====
    # User -> Donation (donor / receiver)
    conn(ax, user_x + 3, user_y, don_x + don_w - 2, don_y + don_h,
         "1", "0..N", "doa", curved=True, rad=0.15,
         label_offset=(0, 0))
    conn(ax, user_x + 8, user_y, don_x + don_w, don_y + don_h - 3,
         "0..1", "0..N", "recebe", curved=True, rad=-0.05,
         label_offset=(-2, 1))

    # User -> DeliveryRequest (volunteer)
    conn(ax, user_x + user_w / 2, user_y, dr_x + dr_w / 2, dr_y + dr_h,
         "1", "0..N", "voluntário", label_offset=(2, 0))

    # User -> Review (author / target)
    conn(ax, user_x + user_w - 4, user_y, rv_x + 4, rv_y + rv_h,
         "1", "0..N", "autor", curved=True, rad=-0.1,
         label_offset=(0, 0))
    conn(ax, user_x + user_w - 2, user_y, rv_x + rv_w - 6, rv_y + rv_h,
         "1", "0..N", "alvo", curved=True, rad=0.25,
         label_offset=(4, 0))

    # Donation -> DeliveryRequest
    conn(ax, don_x + don_w, don_y + don_h / 2,
         dr_x, dr_y + dr_h / 2, "1", "0..N", "tem")

    # Donation -> Review
    conn(ax, don_x + don_w, don_y + 3,
         rv_x, rv_y + 3, "1", "0..N", "review",
         curved=True, rad=-0.2)

    # Donation -> Category
    conn(ax, don_x + 4, don_y, cat_x + cat_w / 2, leaf_y + leaf_h,
         "0..N", "1", "pertence a", curved=True, rad=0.15,
         label_offset=(-2, 0))

    # Donation -> DonationImage
    conn(ax, don_x + don_w - 4, don_y, img_x + img_w / 2, leaf_y + leaf_h,
         "1", "0..N", "imagens", curved=True, rad=-0.1,
         label_offset=(1, 0))

    # User -> Address
    conn(ax, user_x + 2, user_y, addr_x + addr_w / 2, leaf_y + leaf_h,
         "1", "0..N", "endereços", curved=True, rad=0.3,
         label_offset=(-3, -2))

    # User -> RefreshToken
    conn(ax, user_x + user_w / 2 + 1, user_y, rt_x + rt_w / 2, leaf_y + leaf_h,
         "1", "0..N", "tokens", curved=True, rad=0.0,
         label_offset=(2, -2))

    # User -> AuditLog
    conn(ax, user_x + user_w - 2, user_y, log_x + log_w / 2, leaf_y + leaf_h,
         "1", "0..N", "audita", curved=True, rad=-0.25,
         label_offset=(3, -2))

    # ===== Legenda =====
    lx, ly = 89, 47
    ax.add_patch(Rectangle((lx, ly), 9, 16, fill=True,
                           facecolor="white",
                           edgecolor=PALETTE["primary"], lw=0.8))
    ax.text(lx + 4.5, ly + 15, "Legenda",
            fontsize=8.5, fontweight="bold", ha="center",
            color=PALETTE["primary"])
    items = [
        ("PK", "chave primária"),
        ("FK", "chave estrangeira"),
        ("·", "atributo simples"),
    ]
    for i, (k, v) in enumerate(items):
        ax.text(lx + 0.3, ly + 13.5 - i * 1.2, k,
                fontsize=7, va="center",
                color=PALETTE["primary"] if k == "PK" else (
                    PALETTE["accent"] if k == "FK" else PALETTE["text"]),
                fontweight="bold")
        ax.text(lx + 1.8, ly + 13.5 - i * 1.2, v,
                fontsize=6.4, va="center", color=PALETTE["text"])
    ax.text(lx + 0.3, ly + 9.5, "Cardinalidade",
            fontsize=7, fontweight="bold", color=PALETTE["danger"])
    cards = ["1", "0..1", "0..N", "1..N"]
    for i, c in enumerate(cards):
        ax.text(lx + 0.6, ly + 8 - i * 1.0, c, fontsize=6.5,
                color=PALETTE["danger"], fontweight="bold",
                va="center",
                bbox=dict(facecolor="white",
                          edgecolor=PALETTE["danger"],
                          boxstyle="round,pad=0.1", lw=0.4))
        labels = ["obrigatório", "opcional", "muitos opcionais", "muitos"]
        ax.text(lx + 2.0, ly + 8 - i * 1.0, labels[i],
                fontsize=6.0, va="center", color=PALETTE["text"])
    ax.text(lx + 4.5, ly + 2.6, "SGBD",
            fontsize=7, fontweight="bold", ha="center", color=PALETTE["primary"])
    ax.text(lx + 4.5, ly + 1.5, "PostgreSQL 16",
            fontsize=6.5, ha="center", color=PALETTE["text"])
    ax.text(lx + 4.5, ly + 0.6, "via Prisma ORM",
            fontsize=6.0, ha="center", color=PALETTE["neutral"], style="italic")

    save_pdf_and_png(fig, "DER")


if __name__ == "__main__":
    print("Gerando DER...")
    gen()
