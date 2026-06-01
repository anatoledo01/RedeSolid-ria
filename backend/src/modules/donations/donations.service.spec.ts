/**
 * Testes do DonationsService — onde os 3 padrões se encontram.
 *
 *  - create / update / updateStatus / reserve / remove com Prisma mockado
 *  - reserve dispara Strategy (notify) E Observer (bus.emit)
 *  - regras de autorização (ForbiddenException) por papel/dono
 *  - reservar doação não disponível → BadRequestException
 */

import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { DonationStatus, Role } from '@prisma/client';
import { DonationsService } from './donations.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as NotificationModule from '../../domain/notifications/notification.strategy';
import * as EventBusModule from '../../domain/events/donation-event-bus';

function makeDonation(overrides: any = {}) {
  return {
    id: 'd-1',
    title: 'Cesta básica completa',
    description: 'desc',
    quantity: 1,
    status: DonationStatus.AVAILABLE,
    locationText: null,
    donorId: 'u-doer',
    receiverId: null,
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    donor: {
      id: 'u-doer',
      name: 'Maria',
      email: 'maria@email.com',
      avatar: null,
    },
    receiver: null,
    category: { id: 'cat-1', name: 'Alimentos' },
    images: [],
    _count: { reviews: 0, deliveries: 0 },
    ...overrides,
  };
}

function buildService() {
  const prisma = {
    donation: {
      findUnique: jest.fn(),
      findMany:   jest.fn(),
      count:      jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
    },
  } as unknown as PrismaService;

  // Espia o notify e o emit ANTES do service ser construído.
  const notifySpy = jest
    .spyOn(NotificationModule.NotificationService.prototype, 'notify')
    .mockResolvedValue({ ok: true, channel: 'console' });
  const emitSpy = jest
    .spyOn(EventBusModule.DonationEventBus.prototype, 'emit')
    .mockResolvedValue(undefined);

  const service = new DonationsService(prisma);
  return { service, prisma, notifySpy, emitSpy };
}

afterEach(() => jest.restoreAllMocks());

// =============================================================
describe('DonationsService.create', () => {
  it('chama prisma.donation.create com o donorId e include', async () => {
    const { service, prisma } = buildService();
    (prisma as any).donation.create.mockResolvedValue(makeDonation());

    await service.create('u-doer', {
      title: 'X',
      description: 'Y',
      categoryId: 'cat-1',
    } as any);

    const args = (prisma as any).donation.create.mock.calls[0][0];
    expect(args.data.donorId).toBe('u-doer');
    expect(args.include).toBeDefined();
  });
});

// =============================================================
describe('DonationsService.findOne', () => {
  it('lança NotFoundException quando não acha', async () => {
    const { service, prisma } = buildService();
    (prisma as any).donation.findUnique.mockResolvedValue(null);
    await expect(service.findOne('xx')).rejects.toBeInstanceOf(NotFoundException);
  });
});

// =============================================================
describe('DonationsService.update', () => {
  it('proíbe edição se o usuário não for o doador nem admin', async () => {
    const { service, prisma } = buildService();
    (prisma as any).donation.findUnique.mockResolvedValue(makeDonation());
    await expect(
      service.update('d-1', 'outro-user', Role.DONOR, { title: 'X' } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('admin pode editar qualquer doação', async () => {
    const { service, prisma } = buildService();
    (prisma as any).donation.findUnique.mockResolvedValue(makeDonation());
    (prisma as any).donation.update.mockResolvedValue(
      makeDonation({ title: 'novo' }),
    );
    const r = await service.update('d-1', 'admin-user', Role.ADMIN,
      { title: 'novo' } as any);
    expect(r.title).toBe('novo');
  });
});

// =============================================================
describe('DonationsService.updateStatus — dispara Observer', () => {
  it('atualiza e emite evento no bus', async () => {
    const { service, prisma, emitSpy } = buildService();
    (prisma as any).donation.findUnique.mockResolvedValue(makeDonation());
    (prisma as any).donation.update.mockResolvedValue(
      makeDonation({ status: DonationStatus.IN_TRANSIT }),
    );

    const r = await service.updateStatus(
      'd-1', 'u-doer', Role.DONOR, DonationStatus.IN_TRANSIT,
    );
    expect(r.status).toBe(DonationStatus.IN_TRANSIT);
    expect(emitSpy).toHaveBeenCalledWith(
      'd-1', DonationStatus.IN_TRANSIT, 'u-doer',
    );
  });

  it('proíbe mudança de status por não-dono não-admin', async () => {
    const { service, prisma } = buildService();
    (prisma as any).donation.findUnique.mockResolvedValue(makeDonation());
    await expect(
      service.updateStatus('d-1', 'outro', Role.DONOR, DonationStatus.RESERVED),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

// =============================================================
describe('DonationsService.reserve — dispara Strategy + Observer', () => {
  it('reserva, notifica doador (Strategy) e emite evento (Observer)', async () => {
    const { service, prisma, notifySpy, emitSpy } = buildService();
    (prisma as any).donation.findUnique.mockResolvedValue(makeDonation());
    (prisma as any).donation.update.mockResolvedValue(
      makeDonation({
        status: DonationStatus.RESERVED,
        receiverId: 'u-receiver',
      }),
    );

    const r = await service.reserve('d-1', 'u-receiver');

    expect(r.status).toBe(DonationStatus.RESERVED);

    // Strategy: notify foi chamado com o email do doador
    expect(notifySpy).toHaveBeenCalledTimes(1);
    const payload = notifySpy.mock.calls[0][0];
    expect(payload.to).toBe('maria@email.com');
    expect(payload.subject).toContain('reservada');
    expect(payload.metadata).toEqual({
      donationId: 'd-1', event: 'RESERVED',
    });

    // Observer: bus.emit foi chamado
    expect(emitSpy).toHaveBeenCalledWith(
      'd-1', DonationStatus.RESERVED, 'u-receiver',
    );
  });

  it('lança BadRequestException se a doação não estiver disponível', async () => {
    const { service, prisma } = buildService();
    (prisma as any).donation.findUnique.mockResolvedValue(
      makeDonation({ status: DonationStatus.RESERVED }),
    );

    await expect(service.reserve('d-1', 'u-receiver'))
      .rejects.toBeInstanceOf(BadRequestException);
  });
});

// =============================================================
describe('DonationsService.remove', () => {
  it('soft-delete via status=CANCELLED', async () => {
    const { service, prisma } = buildService();
    (prisma as any).donation.findUnique.mockResolvedValue(makeDonation());
    (prisma as any).donation.update.mockResolvedValue(
      makeDonation({ status: DonationStatus.CANCELLED }),
    );
    const r = await service.remove('d-1', 'u-doer', Role.DONOR);
    expect(r.status).toBe(DonationStatus.CANCELLED);
  });

  it('proíbe remoção por terceiro', async () => {
    const { service, prisma } = buildService();
    (prisma as any).donation.findUnique.mockResolvedValue(makeDonation());
    await expect(service.remove('d-1', 'outro', Role.DONOR))
      .rejects.toBeInstanceOf(ForbiddenException);
  });
});
