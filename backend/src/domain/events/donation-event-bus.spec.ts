/**
 * Testes do padrão OBSERVER.
 *
 *  - subscribe não duplica
 *  - notify chama todos os observers
 *  - falha de um observer NÃO derruba os outros
 *  - unsubscribe remove e o observer não é mais chamado
 *  - emit helper monta o payload
 *  - observers concretos: NotifyDonor / AuditTrail / DashboardCache
 *    são instanciáveis e implementam a interface
 */

import { DonationStatus } from '@prisma/client';
import {
  DonationEventBus,
  DonationEvent,
  DonationObserver,
  NotifyDonorObserver,
  AuditTrailObserver,
  DashboardCacheObserver,
} from './donation-event-bus';

class SpyObserver implements DonationObserver {
  readonly name: string;
  readonly received: DonationEvent[] = [];
  constructor(name: string) {
    this.name = name;
  }
  async update(e: DonationEvent) {
    this.received.push(e);
  }
}

class FailingObserver implements DonationObserver {
  readonly name = 'FailingObserver';
  async update() {
    throw new Error('integração fora do ar');
  }
}

describe('DonationEventBus — Subject', () => {
  it('subscribe não duplica o mesmo observer', () => {
    const bus = new DonationEventBus();
    const obs = new SpyObserver('Spy');
    bus.subscribe(obs);
    bus.subscribe(obs);
    bus.subscribe(obs);
    return bus.emit('d-1', DonationStatus.RESERVED).then(() => {
      expect(obs.received).toHaveLength(1);
    });
  });

  it('notify dispara update em todos os observers inscritos', async () => {
    const bus = new DonationEventBus();
    const a = new SpyObserver('A');
    const b = new SpyObserver('B');
    const c = new SpyObserver('C');
    bus.subscribe(a);
    bus.subscribe(b);
    bus.subscribe(c);

    await bus.emit('d-1', DonationStatus.DELIVERED, 'voluntário-1');

    expect(a.received).toHaveLength(1);
    expect(b.received).toHaveLength(1);
    expect(c.received).toHaveLength(1);
    expect(a.received[0].donationId).toBe('d-1');
    expect(a.received[0].status).toBe(DonationStatus.DELIVERED);
    expect(a.received[0].actorId).toBe('voluntário-1');
    expect(a.received[0].occurredAt).toBeInstanceOf(Date);
  });

  it('falha de um observer NÃO impede os outros de rodarem', async () => {
    const bus = new DonationEventBus();
    const good1 = new SpyObserver('Good1');
    const bad   = new FailingObserver();
    const good2 = new SpyObserver('Good2');
    bus.subscribe(good1);
    bus.subscribe(bad);
    bus.subscribe(good2);

    await expect(bus.emit('d-2', DonationStatus.RESERVED)).resolves.toBeUndefined();
    expect(good1.received).toHaveLength(1);
    expect(good2.received).toHaveLength(1);
  });

  it('unsubscribe remove o observer', async () => {
    const bus = new DonationEventBus();
    const a = new SpyObserver('A');
    const b = new SpyObserver('B');
    bus.subscribe(a);
    bus.subscribe(b);

    await bus.emit('d-1', DonationStatus.RESERVED);
    bus.unsubscribe(a);
    await bus.emit('d-1', DonationStatus.DELIVERED);

    expect(a.received).toHaveLength(1);
    expect(b.received).toHaveLength(2);
  });

  it('emit constrói o evento com timestamp atual', async () => {
    const bus = new DonationEventBus();
    const spy = new SpyObserver('S');
    bus.subscribe(spy);

    const before = Date.now();
    await bus.emit('d-1', DonationStatus.AVAILABLE, 'u1',
                    { foo: 'bar' });
    const after = Date.now();

    const ev = spy.received[0];
    expect(ev.metadata).toEqual({ foo: 'bar' });
    expect(ev.occurredAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(ev.occurredAt.getTime()).toBeLessThanOrEqual(after);
  });
});

describe('Observers concretos', () => {
  const sample: DonationEvent = {
    donationId: 'd-1',
    status: DonationStatus.RESERVED,
    actorId: 'u-1',
    occurredAt: new Date(),
  };

  it('NotifyDonorObserver implementa a interface e não lança', async () => {
    const o = new NotifyDonorObserver();
    expect(o.name).toBe('NotifyDonorObserver');
    await expect(o.update(sample)).resolves.not.toThrow();
  });

  it('AuditTrailObserver implementa a interface e não lança', async () => {
    const o = new AuditTrailObserver();
    expect(o.name).toBe('AuditTrailObserver');
    await expect(o.update(sample)).resolves.not.toThrow();
  });

  it('DashboardCacheObserver implementa a interface e não lança', async () => {
    const o = new DashboardCacheObserver();
    expect(o.name).toBe('DashboardCacheObserver');
    await expect(o.update(sample)).resolves.not.toThrow();
  });

  it('integração: 3 observers concretos + bus reagem a um emit', async () => {
    const bus = new DonationEventBus();
    bus.subscribe(new NotifyDonorObserver());
    bus.subscribe(new AuditTrailObserver());
    bus.subscribe(new DashboardCacheObserver());

    // Sem expectativas explícitas — sucesso = ninguém lançou
    await expect(
      bus.emit('d-int', DonationStatus.DELIVERED, 'u-int'),
    ).resolves.toBeUndefined();
  });
});
