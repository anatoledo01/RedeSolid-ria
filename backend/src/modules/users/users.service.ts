import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, Role } from '@prisma/client';
import { UserFactory, Action } from '../../domain/users/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly selectFields = {
    id: true,
    name: true,
    email: true,
    role: true,
    phone: true,
    avatar: true,
    isApproved: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
  }) {
    const { page = 1, limit = 10, search, role } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: this.selectFields,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...this.selectFields,
        addresses: true,
        _count: {
          select: {
            donationsAsDonor: true,
            donationsAsReceiver: true,
            deliveries: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.selectFields,
    });
  }

  async approve(id: string) {
    // Hidrata a entidade de domínio (polimorfismo: dispara a regra
    // específica da subclasse — ex.: voluntário aprovado libera
    // delivery:accept).
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Usuário não encontrado');
    const domain = UserFactory.fromPrisma(record);
    domain.approve();
    return this.prisma.user.update({
      where: { id },
      data: { isApproved: true },
      select: this.selectFields,
    });
  }

  async block(id: string) {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Usuário não encontrado');
    const domain = UserFactory.fromPrisma(record);
    if (domain.isActive) domain.block();
    else domain.unblock();
    return this.prisma.user.update({
      where: { id },
      data: { isActive: domain.isActive },
      select: this.selectFields,
    });
  }

  /**
   * Verifica se um usuário pode executar uma ação, delegando ao
   * domínio (cada subclasse de AbstractUser sobrescreve canPerform).
   */
  async can(id: string, action: Action): Promise<boolean> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) return false;
    return UserFactory.fromPrisma(record).canPerform(action);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: this.selectFields,
    });
  }
}
