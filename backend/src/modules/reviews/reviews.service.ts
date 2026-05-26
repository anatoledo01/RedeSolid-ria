import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByDonation(donationId: string) {
    return this.prisma.review.findMany({
      where: { donationId },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        target: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(authorId: string, data: {
    targetId: string;
    donationId: string;
    rating: number;
    comment?: string;
  }) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('A avaliação deve ser entre 1 e 5');
    }

    const existing = await this.prisma.review.findFirst({
      where: {
        authorId,
        donationId: data.donationId,
        targetId: data.targetId,
      },
    });

    if (existing) {
      throw new BadRequestException('Você já avaliou este usuário para esta doação');
    }

    return this.prisma.review.create({
      data: {
        authorId,
        targetId: data.targetId,
        donationId: data.donationId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        target: { select: { id: true, name: true, avatar: true } },
      },
    });
  }
}
