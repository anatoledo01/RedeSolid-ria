/**
 * Testes do padrão STRATEGY.
 *
 *  - NotificationService delega para a estratégia atual
 *  - setStrategy troca em runtime
 *  - EmailStrategy valida endereço
 *  - InAppStrategy grava na inbox
 *  - broadcast envia para todas
 */

import {
  NotificationService,
  NotificationStrategy,
  ConsoleNotificationStrategy,
  EmailNotificationStrategy,
  InAppNotificationStrategy,
  NotificationPayload,
  NotificationResult,
  InAppInbox,
} from './notification.strategy';

class FakeStrategy implements NotificationStrategy {
  readonly channel = 'fake';
  readonly sent: NotificationPayload[] = [];
  async send(p: NotificationPayload): Promise<NotificationResult> {
    this.sent.push(p);
    return { ok: true, channel: this.channel, reference: 'fake-ref' };
  }
}

const PAYLOAD: NotificationPayload = {
  to: 'maria@email.com',
  subject: 'teste',
  body: 'corpo',
};

describe('NotificationService — contexto do Strategy', () => {
  it('delega a chamada para a estratégia recebida', async () => {
    const fake = new FakeStrategy();
    const svc = new NotificationService(fake);
    const r = await svc.notify(PAYLOAD);
    expect(r.ok).toBe(true);
    expect(r.channel).toBe('fake');
    expect(fake.sent).toHaveLength(1);
    expect(fake.sent[0].subject).toBe('teste');
  });

  it('setStrategy troca o canal em runtime', async () => {
    const a = new FakeStrategy();
    const b = new FakeStrategy();
    const svc = new NotificationService(a);
    await svc.notify(PAYLOAD);
    svc.setStrategy(b);
    await svc.notify({ ...PAYLOAD, subject: '2º envio' });
    expect(a.sent).toHaveLength(1);
    expect(b.sent).toHaveLength(1);
    expect(b.sent[0].subject).toBe('2º envio');
  });

  it('broadcast envia para várias estratégias em paralelo', async () => {
    const a = new FakeStrategy();
    const b = new FakeStrategy();
    const c = new FakeStrategy();
    const results = await NotificationService.broadcast(PAYLOAD, [a, b, c]);
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.ok)).toBe(true);
    expect(a.sent).toHaveLength(1);
    expect(b.sent).toHaveLength(1);
    expect(c.sent).toHaveLength(1);
  });
});

describe('ConsoleNotificationStrategy', () => {
  it('sempre retorna ok com canal "console"', async () => {
    const s = new ConsoleNotificationStrategy();
    const r = await s.send(PAYLOAD);
    expect(r.ok).toBe(true);
    expect(r.channel).toBe('console');
    expect(r.reference).toMatch(/^console-\d+$/);
  });
});

describe('EmailNotificationStrategy', () => {
  it('aceita endereço válido', async () => {
    const s = new EmailNotificationStrategy();
    const r = await s.send(PAYLOAD);
    expect(r.ok).toBe(true);
    expect(r.channel).toBe('email');
    expect(r.reference).toMatch(/^ses-\d+$/);
  });

  it('rejeita endereço inválido (sem @)', async () => {
    const s = new EmailNotificationStrategy();
    const r = await s.send({ ...PAYLOAD, to: 'sem-arroba' });
    expect(r.ok).toBe(false);
    expect(r.error).toBeDefined();
    expect(r.channel).toBe('email');
  });

  it('usa o provider configurado', async () => {
    const s = new EmailNotificationStrategy({
      fromAddress: 'no-reply@x.com',
      provider: 'sendgrid',
    });
    const r = await s.send(PAYLOAD);
    expect(r.reference).toMatch(/^sendgrid-\d+$/);
  });
});

describe('InAppNotificationStrategy', () => {
  it('grava na inbox e retorna o id gerado', async () => {
    const inbox = new Map<string, unknown>();
    const fakeInbox: InAppInbox = {
      async save(data) {
        const id = `inbox-${inbox.size + 1}`;
        inbox.set(id, data);
        return { id };
      },
    };
    const s = new InAppNotificationStrategy(fakeInbox);
    const r = await s.send({ ...PAYLOAD, to: 'usr_42' });
    expect(r.ok).toBe(true);
    expect(r.reference).toBe('inbox-1');
    expect(inbox.size).toBe(1);
  });
});
