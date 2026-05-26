import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliveryStatus, DonationStatus, Role } from '@prisma/client';

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService) {}

  private readonly includeFields = {
    donation: {
      include: {
        donor: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        category: true,
        images: true,
      },
    },
    volunteer: {
      select: { id: true, name: true, email: true, avatar: true },
    },
  };

  async findAll(params: {
    page?: number;
    limit?: number;
    volunteerId?: string;
    status?: DeliveryStatus;
  }) {
    const { page = 1, limit = 10, volunteerId, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (volunteerId) where.volunteerId = volunteerId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.deliveryRequest.findMany({
        where,
        include: this.includeFields,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deliveryRequest.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const delivery = await this.prisma.deliveryRequest.findUnique({
      where: { id },
      include: this.includeFields,
    });

    if (!delivery) throw new NotFoundException('Entrega não encontrada');
    return delivery;
  }

  async acceptDelivery(donationId: string, volunteerId: string) {
    const donation = await this.prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) throw new NotFoundException('Doação não encontrada');
    if (donation.status !== DonationStatus.RESERVED) {
      throw new BadRequestException('A doação precisa estar reservada para aceitar entrega');
    }

    const existingDelivery = await this.prisma.deliveryRequest.findFirst({
      where: {
        donationId,
        status: { in: [DeliveryStatus.ACCEPTED, DeliveryStatus.IN_TRANSIT] },
      },
    });

    if (existingDelivery) {
      throw new BadRequestException('Já existe um voluntário para esta entrega');
    }

    const delivery = await this.prisma.deliveryRequest.create({
      data: {
        donationId,
        volunteerId,
        status: DeliveryStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: this.includeFields,
    });

    await this.prisma.donation.update({
      where: { id: donationId },
      data: { status: DonationStatus.IN_TRANSIT },
    });

    return delivery;
  }

  async updateStatus(
    id: string,
    userId: string,
    role: Role,
    status: DeliveryStatus,
  ) {
    const delivery = await this.findOne(id);

    if (role !== Role.ADMIN && delivery.volunteerId !== userId) {
      throw new ForbiddenException('Você não pode alterar esta entrega');
    }

    const updateData: any = { status };

    if (status === DeliveryStatus.DELIVERED) {
      updateData.deliveredAt = new Date();

      await this.prisma.donation.update({
        where: { id: delivery.donationId },
        data: { status: DonationStatus.DELIVERED },
      });
    }

    return this.prisma.deliveryRequest.update({
      where: { id },
      data: updateData,
      include: this.includeFields,
    });
  }
}
