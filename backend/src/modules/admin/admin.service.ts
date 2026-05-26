import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DonationStatus, Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      totalDonations,
      deliveredDonations,
      activeVolunteers,
      totalDonors,
      totalReceivers,
      recentDonations,
      donationsByStatus,
      donationsByMonth,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.donation.count(),
      this.prisma.donation.count({ where: { status: DonationStatus.DELIVERED } }),
      this.prisma.user.count({
        where: { role: Role.VOLUNTEER, isActive: true, isApproved: true },
      }),
      this.prisma.user.count({ where: { role: Role.DONOR, isActive: true } }),
      this.prisma.user.count({ where: { role: Role.RECEIVER, isActive: true } }),
      this.prisma.donation.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          donor: { select: { id: true, name: true } },
          category: { select: { name: true } },
        },
      }),
      this.prisma.donation.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.getDonationsByMonth(),
    ]);

    return {
      metrics: {
        totalUsers,
        totalDonations,
        deliveredDonations,
        activeVolunteers,
        totalDonors,
        totalReceivers,
      },
      recentDonations,
      donationsByStatus: donationsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      donationsByMonth,
    };
  }

  async getReports(params: { startDate?: string; endDate?: string }) {
    const where: any = {};

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const [donations, users, deliveries] = await Promise.all([
      this.prisma.donation.findMany({
        where,
        include: {
          donor: { select: { name: true, email: true } },
          receiver: { select: { name: true, email: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.findMany({
        where: params.startDate || params.endDate
          ? { createdAt: where.createdAt }
          : {},
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.deliveryRequest.findMany({
        where,
        include: {
          volunteer: { select: { name: true } },
          donation: { select: { title: true } },
        },
      }),
    ]);

    return { donations, users, deliveries };
  }

  async getLogs(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exportReportsCsv() {
    const donations = await this.prisma.donation.findMany({
      include: {
        donor: { select: { name: true, email: true } },
        receiver: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = 'ID,Título,Categoria,Status,Doador,Recebedor,Quantidade,Data\n';
    const rows = donations
      .map(
        (d) =>
          `${d.id},"${d.title}","${d.category.name}",${d.status},"${d.donor.name}","${d.receiver?.name || ''}",${d.quantity},${d.createdAt.toISOString()}`,
      )
      .join('\n');

    return headers + rows;
  }

  private async getDonationsByMonth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const donations = await this.prisma.donation.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const monthlyData: Record<string, number> = {};
    donations.forEach((d) => {
      const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
