/**
 * Padrão DECORATOR aplicado ao repositório de doações.
 *
 * - Component (interface): DonationRepository
 * - ConcreteComponent     : PrismaDonationRepository
 * - Decorator (abstract)  : DonationRepositoryDecorator
 * - ConcreteDecorators    : AuditDecorator, TimingDecorator, CacheDecorator
 *
 * Cada decorator encapsula uma responsabilidade transversal sem
 * misturá-la à lógica de acesso ao banco.
 */

import { Logger } from '@nestjs/common';
import { Donation, DonationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// =============================================================
// Component
// =============================================================
export interface DonationRepository {
  findOne(id: string): Promise<Donation | null>;
  create(data: Prisma.DonationCreateInput): Promise<Donation>;
  updateStatus(id: string, status: DonationStatus): Promise<Donation>;
}

// =============================================================
// ConcreteComponent
// =============================================================
export class PrismaDonationRepository implements DonationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOne(id: string): Promise<Donation | null> {
    return this.prisma.donation.findUnique({ where: { id } });
  }

  create(data: Prisma.DonationCreateInput): Promise<Donation> {
    return this.prisma.donation.create({ data });
  }

  updateStatus(id: string, status: DonationStatus): Promise<Donation> {
    return this.prisma.donation.update({
      where: { id },
      data: { status },
    });
  }
}

// =============================================================
// Decorator base — encapsula um inner repository e delega
// =============================================================
export abstract class DonationRepositoryDecorator implements DonationRepository {
  constructor(protected readonly inner: DonationRepository) {}

  findOne(id: string): Promise<Donation | null> {
    return this.inner.findOne(id);
  }

  create(data: Prisma.DonationCreateInput): Promise<Donation> {
    return this.inner.create(data);
  }

  updateStatus(id: string, status: DonationStatus): Promise<Donation> {
    return this.inner.updateStatus(id, status);
  }
}

// =============================================================
// Concrete Decorators
// =============================================================

/** Decorator 1 — Auditoria das mutações */
export class AuditDecorator extends DonationRepositoryDecorator {
  private readonly logger = new Logger('AuditDecorator');

  constructor(inner: DonationRepository, private readonly prisma: PrismaService) {
    super(inner);
  }

  async create(data: Prisma.DonationCreateInput): Promise<Donation> {
    const result = await super.create(data);
    await this.prisma.auditLog.create({
      data: {
        action: 'donation:created',
        entity: 'Donation',
        entityId: result.id,
      },
    }).catch((e) => this.logger.warn(`audit log falhou: ${e.message}`));
    return result;
  }

  async updateStatus(id: string, status: DonationStatus): Promise<Donation> {
    const result = await super.updateStatus(id, status);
    await this.prisma.auditLog.create({
      data: {
        action: `donation:${status.toLowerCase()}`,
        entity: 'Donation',
        entityId: id,
      },
    }).catch((e) => this.logger.warn(`audit log falhou: ${e.message}`));
    return result;
  }
}

/** Decorator 2 — Medição de tempo de leitura */
export class TimingDecorator extends DonationRepositoryDecorator {
  private readonly logger = new Logger('TimingDecorator');

  async findOne(id: string): Promise<Donation | null> {
    const t0 = Date.now();
    const r = await super.findOne(id);
    this.logger.log(`findOne(${id}) levou ${Date.now() - t0}ms`);
    return r;
  }
}

/** Decorator 3 — Cache em memória (TTL configurável) */
export class CacheDecorator extends DonationRepositoryDecorator {
  private readonly logger = new Logger('CacheDecorator');
  private readonly cache = new Map<string, { value: Donation; expiresAt: number }>();

  constructor(inner: DonationRepository,
              private readonly ttlMs: number = 60_000) {
    super(inner);
  }

  async findOne(id: string): Promise<Donation | null> {
    const cached = this.cache.get(id);
    if (cached && cached.expiresAt > Date.now()) {
      this.logger.log(`cache HIT  ${id}`);
      return cached.value;
    }
    this.logger.log(`cache MISS ${id}`);
    const fresh = await super.findOne(id);
    if (fresh) {
      this.cache.set(id, {
        value: fresh,
        expiresAt: Date.now() + this.ttlMs,
      });
    }
    return fresh;
  }

  // Mutações invalidam o cache do registro afetado.
  async updateStatus(id: string, status: DonationStatus): Promise<Donation> {
    const r = await super.updateStatus(id, status);
    this.cache.delete(id);
    return r;
  }
}
