/**
 * Testes do UsersService.
 *
 * - approve hidrata domínio (UserFactory) e marca isApproved no banco
 * - block alterna isActive
 * - can devolve true/false conforme matriz polimórfica do domínio
 * - findOne lança NotFoundException quando não acha
 */

import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

function makeUserRow(overrides: Partial<any> = {}) {
  return {
    id: 'u-1',
    name: 'Demo',
    email: 'demo@example.com',
    password: 'hash',
    role: Role.DONOR,
    phone: null,
    avatar: null,
    isApproved: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function buildService(prismaOverrides: any = {}) {
  const baseUser = {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    update:     jest.fn(),
    count:      jest.fn(),
  };
  const prisma = {
    user: { ...baseUser, ...(prismaOverrides.user ?? {}) },
  } as unknown as PrismaService;
  const service = new UsersService(prisma);
  return { service, prisma };
}

describe('UsersService.findOne', () => {
  it('lança NotFoundException quando o usuário não existe', async () => {
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(null);
    await expect(service.findOne('xx')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('devolve o usuário quando existe', async () => {
    const row = makeUserRow();
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(row);
    const r = await service.findOne(row.id);
    expect(r).toBe(row);
  });
});

describe('UsersService.approve', () => {
  it('passa pela hidratação de domínio (UserFactory) e atualiza isApproved=true', async () => {
    const row = makeUserRow({ role: Role.VOLUNTEER, isApproved: false });
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(row);
    (prisma as any).user.update.mockResolvedValue({ ...row, isApproved: true });

    await service.approve(row.id);

    expect((prisma as any).user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: row.id },
        data: { isApproved: true },
      }),
    );
  });

  it('lança NotFoundException quando o usuário não existe', async () => {
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(null);
    await expect(service.approve('xx')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('UsersService.block', () => {
  it('alterna isActive (ativo → bloqueado)', async () => {
    const row = makeUserRow({ isActive: true });
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(row);
    (prisma as any).user.update.mockResolvedValue({ ...row, isActive: false });

    await service.block(row.id);

    expect((prisma as any).user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: row.id },
        data: { isActive: false },
      }),
    );
  });

  it('reativa quando o usuário está inativo', async () => {
    const row = makeUserRow({ isActive: false });
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(row);
    (prisma as any).user.update.mockResolvedValue({ ...row, isActive: true });

    await service.block(row.id);

    expect((prisma as any).user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isActive: true },
      }),
    );
  });
});

describe('UsersService.can — usa o domínio polimórfico', () => {
  it('Admin → admin:dashboard = true', async () => {
    const row = makeUserRow({ role: Role.ADMIN });
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(row);
    await expect(service.can(row.id, 'admin:dashboard')).resolves.toBe(true);
  });

  it('Donor → delivery:accept = false', async () => {
    const row = makeUserRow({ role: Role.DONOR });
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(row);
    await expect(service.can(row.id, 'delivery:accept')).resolves.toBe(false);
  });

  it('Volunteer não-aprovado → delivery:accept = false', async () => {
    const row = makeUserRow({ role: Role.VOLUNTEER, isApproved: false });
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(row);
    await expect(service.can(row.id, 'delivery:accept')).resolves.toBe(false);
  });

  it('Volunteer aprovado → delivery:accept = true', async () => {
    const row = makeUserRow({ role: Role.VOLUNTEER, isApproved: true });
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(row);
    await expect(service.can(row.id, 'delivery:accept')).resolves.toBe(true);
  });

  it('usuário inexistente → can devolve false', async () => {
    const { service, prisma } = buildService();
    (prisma as any).user.findUnique.mockResolvedValue(null);
    await expect(service.can('xx', 'donation:reserve')).resolves.toBe(false);
  });
});
