/**
 * Padrão OBSERVER aplicado a eventos de doação.
 *
 * O DonationsService publica eventos no DonationEventBus quando uma
 * doação muda de status. Observadores se inscrevem no bus e reagem
 * de forma independente — sem que o service os conheça.
 *
 * Concrete observers já previstos:
 *   - NotifyDonorObserver       → envia notificação ao doador
 *   - AuditTrailObserver        → grava AuditLog
 *   - DashboardCacheObserver    → invalida métricas no cache
 *
 * Novos observers (Webhook, Slack...) entram com um único subscribe().
 */

import { Logger } from '@nestjs/common';
import { DonationStatus } from '@prisma/client';

// =============================================================
// Modelo do evento
// =============================================================
export interface DonationEvent {
  donationId: string;
  status: DonationStatus;
  actorId?: string;       // quem disparou (doador / recebedor / admin)
  occurredAt: Date;
  metadata?: Record<string, unknown>;
}

// =============================================================
// Contratos GoF
// =============================================================
export interface DonationObserver {
  readonly name: string;
  update(event: DonationEvent): Promise<void> | void;
}

export interface DonationSubject {
  subscribe(observer: DonationObserver): void;
  unsubscribe(observer: DonationObserver): void;
  notify(event: DonationEvent): Promise<void>;
}

// =============================================================
// Concrete Subject
// =============================================================
export class DonationEventBus implements DonationSubject {
  private readonly logger = new Logger('DonationEventBus');
  private readonly observers: DonationObserver[] = [];

  subscribe(observer: DonationObserver): void {
    if (this.observers.includes(observer)) return;
    this.observers.push(observer);
    this.logger.log(`inscrito: ${observer.name}`);
  }

  unsubscribe(observer: DonationObserver): void {
    const idx = this.observers.indexOf(observer);
    if (idx >= 0) this.observers.splice(idx, 1);
  }

  async notify(event: DonationEvent): Promise<void> {
    // Falha de um observer não derruba os outros — em produção
    // mandaríamos a falha para um dead-letter / Sentry.
    for (const o of this.observers) {
      try {
        await o.update(event);
      } catch (err) {
        this.logger.warn(
          `observer ${o.name} falhou para ${event.status}: ${
            (err as Error).message
          }`,
        );
      }
    }
  }

  /** Helper conveniente para o service emitir um evento sem montar o
   *  payload completo na unha. */
  emit(donationId: string, status: DonationStatus, actorId?: string,
       metadata?: Record<string, unknown>): Promise<void> {
    return this.notify({
      donationId,
      status,
      actorId,
      occurredAt: new Date(),
      metadata,
    });
  }
}

// =============================================================
// Concrete Observers
// =============================================================

/** Observer 1 — Notifica o doador */
export class NotifyDonorObserver implements DonationObserver {
  readonly name = 'NotifyDonorObserver';
  private readonly logger = new Logger(this.name);

  async update(event: DonationEvent): Promise<void> {
    // Em produção, dispararia NotificationService.notify(...)
    this.logger.log(
      `[email] donor da doação ${event.donationId}: status agora é ` +
      `${event.status}`,
    );
  }
}

/** Observer 2 — Trilha de auditoria */
export class AuditTrailObserver implements DonationObserver {
  readonly name = 'AuditTrailObserver';
  private readonly logger = new Logger(this.name);

  async update(event: DonationEvent): Promise<void> {
    this.logger.log(
      `AuditLog: action=donation:${event.status.toLowerCase()} ` +
      `entityId=${event.donationId} actor=${event.actorId ?? 'system'}`,
    );
    // Em produção: prisma.auditLog.create({...})
  }
}

/** Observer 3 — Cache do dashboard */
export class DashboardCacheObserver implements DonationObserver {
  readonly name = 'DashboardCacheObserver';
  private readonly logger = new Logger(this.name);
  private readonly cache = new Map<string, number>();

  async update(event: DonationEvent): Promise<void> {
    const key = `dashboard:donations:${event.status.toLowerCase()}`;
    this.cache.delete(key);
    this.logger.log(`invalidado cache: ${key}`);
  }
}
