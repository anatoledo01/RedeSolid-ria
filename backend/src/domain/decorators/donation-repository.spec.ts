/**
 * Testes do padrão DECORATOR.
 *
 *  - PrismaDonationRepository delega ao Prisma
 *  - AuditDecorator chama prisma.auditLog.create após cada mutação
 *  - TimingDecorator não altera resultado, só mede
 *  - CacheDecorator: HIT/MISS, TTL, invalidação ao updateStatus
 *  - Composição de decoradores empilha sem perder funcionalidade
 */

import { Donation, DonationStatus, Prisma } from '@prisma/client';
import {
  DonationRepository,
  PrismaDonationRepository,
  DonationRepositoryDecorator,
  AuditDecorator,
  TimingDecorator,
  CacheDecorator,
} from './donation-repository';

// =============================================================
// Stubs
// =============================================================
function makeDonation(overrides: Partial<Donation> = {}): Donation {
  return {
    id: 'd-1',
    title: 'Cesta básica',
    description: 'completa',
    quantity: 1,
    status: DonationStatus.AVAILABLE,
    locationText: null,
    donorId: 'u-doer',
    receiverId: null,
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

class InMemoryRepo implements DonationRepository {
  readonly data = new Map<string, Donation>([
    ['d-1', makeDonation()],
    ['d-2', makeDonation({ id: 'd-2', title: 'Cobertor' })],
  ]);
  readonly callsFindOne: string[] = [];

  async findOne(id: string) {
    this.callsFindOne.push(id);
    return this.data.get(id) ?? null;
  }
  async create(data: Prisma.DonationCreateInput) {
    const d = makeDonation({
      id: `d-${this.data.size + 1}`,
      title: data.title as string,
    });
    this.data.set(d.id, d);
    return d;
  }
  async updateStatus(id: string, status: DonationStatus) {
    const cur = this.data.get(id);
    if (!cur) throw new Error('not found');
    const next = { ...cur, status };
    this.data.set(id, next);
    return next;
  }
}

// =============================================================
// PrismaDonationRepository — apenas delega
// =============================================================
describe('PrismaDonationRepository', () => {
  function makePrismaMock() {
    return {
      donation: {
        findUnique: jest.fn().mockResolvedValue(makeDonation()),
        create:     jest.fn().mockResolvedValue(makeDonation()),
        update:     jest.fn().mockResolvedValue(
          makeDonation({ status: DonationStatus.RESERVED }),
        ),
      },
    } as any;
  }

  it('findOne chama prisma.donation.findUnique', async () => {
    const prisma = makePrismaMock();
    const repo = new PrismaDonationRepository(prisma);
    const r = await repo.findOne('d-1');
    expect(prisma.donation.findUnique).toHaveBeenCalledWith({
      where: { id: 'd-1' },
    });
    expect(r?.id).toBe('d-1');
  });

  it('updateStatus chama prisma.donation.update', async () => {
    const prisma = makePrismaMock();
    const repo = new PrismaDonationRepository(prisma);
    const r = await repo.updateStatus('d-1', DonationStatus.RESERVED);
    expect(prisma.donation.update).toHaveBeenCalledWith({
      where: { id: 'd-1' },
      data: { status: DonationStatus.RESERVED },
    });
    expect(r.status).toBe(DonationStatus.RESERVED);
  });
});

// =============================================================
// DonationRepositoryDecorator (abstrato) — delegação padrão
// =============================================================
describe('DonationRepositoryDecorator (base)', () => {
  class PassthroughDecorator extends DonationRepositoryDecorator {}

  it('por padrão delega todas as chamadas ao inner', async () => {
    const inner = new InMemoryRepo();
    const repo = new PassthroughDecorator(inner);
    const d = await repo.findOne('d-1');
    expect(d?.id).toBe('d-1');
    expect(inner.callsFindOne).toEqual(['d-1']);
  });
});

// =============================================================
// AuditDecorator
// =============================================================
describe('AuditDecorator', () => {
  it('grava AuditLog após updateStatus', async () => {
    const inner = new InMemoryRepo();
    const auditCreate = jest.fn().mockResolvedValue({});
    const prisma = { auditLog: { create: auditCreate } } as any;
    const repo = new AuditDecorator(inner, prisma);

    await repo.updateStatus('d-1', DonationStatus.RESERVED);

    expect(auditCreate).toHaveBeenCalledTimes(1);
    expect(auditCreate.mock.calls[0][0].data).toMatchObject({
      action: 'donation:reserved',
      entity: 'Donation',
      entityId: 'd-1',
    });
  });

  it('grava AuditLog após create', async () => {
    const inner = new InMemoryRepo();
    const auditCreate = jest.fn().mockResolvedValue({});
    const prisma = { auditLog: { create: auditCreate } } as any;
    const repo = new AuditDecorator(inner, prisma);

    const created = await repo.create({
      title: 'Roupas de inverno',
    } as any);

    expect(auditCreate).toHaveBeenCalledTimes(1);
    expect(auditCreate.mock.calls[0][0].data.action).toBe('donation:created');
    expect(auditCreate.mock.calls[0][0].data.entityId).toBe(created.id);
  });

  it('falha do auditLog não impede o retorno do resultado', async () => {
    const inner = new InMemoryRepo();
    const auditCreate = jest.fn().mockRejectedValue(new Error('db down'));
    const prisma = { auditLog: { create: auditCreate } } as any;
    const repo = new AuditDecorator(inner, prisma);

    const r = await repo.updateStatus('d-1', DonationStatus.DELIVERED);
    expect(r.status).toBe(DonationStatus.DELIVERED);
  });
});

// =============================================================
// TimingDecorator
// =============================================================
describe('TimingDecorator', () => {
  it('não altera o resultado de findOne', async () => {
    const inner = new InMemoryRepo();
    const repo = new TimingDecorator(inner);
    const r = await repo.findOne('d-1');
    expect(r?.id).toBe('d-1');
  });
});

// =============================================================
// CacheDecorator
// =============================================================
describe('CacheDecorator', () => {
  it('MISS na primeira leitura, HIT na segunda do mesmo id', async () => {
    const inner = new InMemoryRepo();
    const repo = new CacheDecorator(inner, 5000);

    await repo.findOne('d-1');
    await repo.findOne('d-1');
    await repo.findOne('d-1');

    // O inner só foi chamado UMA vez — as outras vieram do cache
    expect(inner.callsFindOne).toEqual(['d-1']);
  });

  it('cada id é cacheado separadamente', async () => {
    const inner = new InMemoryRepo();
    const repo = new CacheDecorator(inner, 5000);

    await repo.findOne('d-1');
    await repo.findOne('d-2');
    await repo.findOne('d-1');

    expect(inner.callsFindOne).toEqual(['d-1', 'd-2']);
  });

  it('updateStatus invalida o cache do registro', async () => {
    const inner = new InMemoryRepo();
    const repo = new CacheDecorator(inner, 5000);

    await repo.findOne('d-1');                              // MISS
    await repo.findOne('d-1');                              // HIT
    await repo.updateStatus('d-1', DonationStatus.RESERVED); // invalida
    await repo.findOne('d-1');                              // MISS de novo

    expect(inner.callsFindOne).toEqual(['d-1', 'd-1']);
  });

  it('TTL expira o cache', async () => {
    const inner = new InMemoryRepo();
    const repo = new CacheDecorator(inner, 1); // TTL 1ms

    await repo.findOne('d-1');                  // MISS, cacheia
    await new Promise((r) => setTimeout(r, 10));
    await repo.findOne('d-1');                  // expirou → MISS

    expect(inner.callsFindOne).toEqual(['d-1', 'd-1']);
  });

  it('não cacheia null (registro não encontrado)', async () => {
    const inner = new InMemoryRepo();
    const repo = new CacheDecorator(inner, 5000);

    const r1 = await repo.findOne('nao-existe');
    const r2 = await repo.findOne('nao-existe');
    expect(r1).toBeNull();
    expect(r2).toBeNull();
    expect(inner.callsFindOne).toEqual(['nao-existe', 'nao-existe']);
  });
});

// =============================================================
// Composição de decoradores
// =============================================================
describe('Composição: Audit ∘ Timing ∘ Cache ∘ Inner', () => {
  it('mantém o comportamento dos 3 decoradores empilhados', async () => {
    const inner = new InMemoryRepo();
    const auditCreate = jest.fn().mockResolvedValue({});
    const prisma = { auditLog: { create: auditCreate } } as any;

    const cached = new CacheDecorator(inner, 5000);
    const timed  = new TimingDecorator(cached);
    const repo   = new AuditDecorator(timed, prisma);

    // 1ª leitura: MISS no cache → consulta inner
    expect(await repo.findOne('d-1')).not.toBeNull();
    // 2ª: HIT no cache → não toca inner
    expect(await repo.findOne('d-1')).not.toBeNull();
    expect(inner.callsFindOne).toHaveLength(1);

    // update → AuditLog + invalida cache
    await repo.updateStatus('d-1', DonationStatus.RESERVED);
    expect(auditCreate).toHaveBeenCalledTimes(1);

    // 3ª leitura: cache foi invalidado → MISS de novo
    await repo.findOne('d-1');
    expect(inner.callsFindOne).toHaveLength(2);
  });
});
