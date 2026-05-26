import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { QueryDonationDto } from './dto/query-donation.dto';
import { DonationStatus, Role } from '@prisma/client';

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService) {}

  private readonly includeFields = {
    donor: {
      select: { id: true, name: true, email: true, avatar: true },
    },
    receiver: {
      select: { id: true, name: true, email: true, avatar: true },
    },
    category: true,
    images: true,
    _count: {
      select: { reviews: true, deliveries: true },
    },
  };

  async create(donorId: string, dto: CreateDonationDto) {
    return this.prisma.donation.create({
      data: {
        title: dto.title,
        description: dto.description,
        quantity: dto.quantity || 1,
        locationText: dto.locationText,
        donorId,
        categoryId: dto.categoryId,
        images: dto.imageUrls
          ? {
              create: dto.imageUrls.map((url) => ({
                url,
                filename: url.split('/').pop() || 'image',
              })),
            }
          : undefined,
      },
      include: this.includeFields,
    });
  }

  async findAll(query: QueryDonationDto) {
    const {
      page = 1,
      limit = 12,
      search,
      status,
      categoryId,
      donorId,
      receiverId,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { locationText: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (donorId) where.donorId = donorId;
    if (receiverId) where.receiverId = receiverId;

    const [data, total] = await Promise.all([
      this.prisma.donation.findMany({
        where,
        include: this.includeFields,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.donation.count({ where }),
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
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: {
        ...this.includeFields,
        deliveries: {
          include: {
            volunteer: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        reviews: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!donation) {
      throw new NotFoundException('Doação não encontrada');
    }

    return donation;
  }

  async update(id: string, userId: string, role: Role, dto: UpdateDonationDto) {
    const donation = await this.findOne(id);

    if (role !== Role.ADMIN && donation.donorId !== userId) {
      throw new ForbiddenException('Você não pode editar esta doação');
    }

    return this.prisma.donation.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        quantity: dto.quantity,
        locationText: dto.locationText,
        categoryId: dto.categoryId,
      },
      include: this.includeFields,
    });
  }

  async updateStatus(
    id: string,
    userId: string,
    role: Role,
    status: DonationStatus,
  ) {
    const donation = await this.findOne(id);

    if (role !== Role.ADMIN && donation.donorId !== userId) {
      throw new ForbiddenException('Você não pode alterar o status desta doação');
    }

    return this.prisma.donation.update({
      where: { id },
      data: { status },
      include: this.includeFields,
    });
  }

  async reserve(id: string, receiverId: string) {
    const donation = await this.findOne(id);

    if (donation.status !== DonationStatus.AVAILABLE) {
      throw new BadRequestException('Esta doação não está disponível');
    }

    return this.prisma.donation.update({
      where: { id },
      data: {
        receiverId,
        status: DonationStatus.RESERVED,
      },
      include: this.includeFields,
    });
  }

  async remove(id: string, userId: string, role: Role) {
    const donation = await this.findOne(id);

    if (role !== Role.ADMIN && donation.donorId !== userId) {
      throw new ForbiddenException('Você não pode remover esta doação');
    }

    return this.prisma.donation.update({
      where: { id },
      data: { status: DonationStatus.CANCELLED },
      include: this.includeFields,
    });
  }
}
