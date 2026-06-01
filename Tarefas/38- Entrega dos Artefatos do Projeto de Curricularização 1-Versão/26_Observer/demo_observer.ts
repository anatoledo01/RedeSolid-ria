/**
 * Demonstração standalone do padrão OBSERVER.
 * Rodar com: npx ts-node demo_observer.ts
 *
 * A versão real está em backend/src/domain/events/donation-event-bus.ts
 * e é instanciada pelo DonationsService — quando uma doação muda de
 * status, três observers são chamados em sequência.
 */

// ============ EVENTO ============
type DonationStatus = 'AVAILABLE' | 'RESERVED' | 'DELIVERED' | 'CANCELLED';

interface DonationEvent {
  donationId: string;
  status: DonationStatus;
  actorId?: string;
  occurredAt: Date;
}

// ============ CONTRATOS ============
interface DonationObserver {
  readonly name: string;
  update(event: DonationEvent): Promise<void> | void;
}

interface DonationSubject {
  subscribe(o: DonationObserver): void;
  unsubscribe(o: DonationObserver): void;
  notify(event: DonationEvent): Promise<void>;
}

// ============ SUBJECT ============
class DonationEventBus implements DonationSubject {
  private readonly observers: DonationObserver[] = [];

  subscribe(o: DonationObserver) {
    if (!this.observers.includes(o)) {
      this.observers.push(o);
      console.log(`[bus] inscrito: ${o.name}`);
    }
  }
  unsubscribe(o: DonationObserver) {
    const i = this.observers.indexOf(o);
    if (i >= 0) this.observers.splice(i, 1);
  }
  async notify(event: DonationEvent) {
    for (const o of this.observers) {
      try { await o.update(event); }
      catch (e) {
        console.warn(`  ! observer ${o.name} falhou:`, (e as Error).message);
      }
    }
  }
  emit(donationId: string, status: DonationStatus, actorId?: string) {
    return this.notify({ donationId, status, actorId, occurredAt: new Date() });
  }
}

// ============ CONCRETE OBSERVERS ============
class NotifyDonorObserver implements DonationObserver {
  readonly name = 'NotifyDonorObserver';
  async update(e: DonationEvent) {
    const msg = e.status === 'RESERVED'
      ? '"sua doação foi reservada"'
      : e.status === 'DELIVERED' ? '"doação entregue"'
      : `"status: ${e.status}"`;
    console.log(`  [Notify]  email para doador de ${e.donationId}: ${msg}`);
  }
}

class AuditTrailObserver implements DonationObserver {
  readonly name = 'AuditTrailObserver';
  async update(e: DonationEvent) {
    console.log(
      `  [Audit]   AuditLog gravado: ` +
      `action=donation:${e.status.toLowerCase()} ` +
      `entityId=${e.donationId} actor=${e.actorId ?? 'system'}`
    );
  }
}

class DashboardCacheObserver implements DonationObserver {
  readonly name = 'DashboardCacheObserver';
  async update(e: DonationEvent) {
    console.log(`  [Cache]   invalidando dashboard:donations:${e.status.toLowerCase()}`);
  }
}

/** Observer "instável" — vai falhar de propósito p/ mostrar isolamento. */
class FlakyObserver implements DonationObserver {
  readonly name = 'FlakyObserver';
  async update() { throw new Error('integração externa fora do ar'); }
}

// ============ DEMO ============
async function main() {
  const bus = new DonationEventBus();
  bus.subscribe(new NotifyDonorObserver());
  bus.subscribe(new AuditTrailObserver());
  bus.subscribe(new DashboardCacheObserver());
  bus.subscribe(new FlakyObserver());   // vai falhar — mas não derruba os outros

  console.log('\n→ emit RESERVED (doação d-101)');
  await bus.emit('d-101', 'RESERVED', 'usr_esperanca');

  console.log('\n→ emit DELIVERED (doação d-101)');
  await bus.emit('d-101', 'DELIVERED', 'usr_ana');
}

main();
