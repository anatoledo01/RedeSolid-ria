/**
 * Demonstração standalone do padrão STRATEGY.
 * Rodar com: npx ts-node demo_strategy.ts
 *
 * NOTA: cópia auto-contida sem dependência do NestJS. A versão real
 * fica em backend/src/domain/notifications/notification.strategy.ts e
 * é usada pelo DonationsService quando uma doação é reservada.
 */

// ============ CONTRATO ============
interface NotificationPayload {
  to: string;
  subject: string;
  body: string;
}

interface NotificationResult {
  ok: boolean;
  channel: string;
  reference?: string;
  error?: string;
}

interface NotificationStrategy {
  readonly channel: string;
  send(p: NotificationPayload): Promise<NotificationResult>;
}

// ============ ESTRATÉGIAS ============
class ConsoleNotificationStrategy implements NotificationStrategy {
  readonly channel = 'console';
  async send(p: NotificationPayload): Promise<NotificationResult> {
    console.log(`  [console → ${p.to}] ${p.subject}`);
    console.log(`            ${p.body}`);
    return { ok: true, channel: this.channel, reference: `c-${Date.now()}` };
  }
}

class EmailNotificationStrategy implements NotificationStrategy {
  readonly channel = 'email';
  constructor(private from = 'no-reply@redesolidaria.org') {}
  async send(p: NotificationPayload): Promise<NotificationResult> {
    if (!p.to.includes('@')) {
      return { ok: false, channel: this.channel, error: 'email inválido' };
    }
    console.log(`  [email ${this.from} → ${p.to}] ${p.subject}`);
    return { ok: true, channel: this.channel, reference: `ses-${Date.now()}` };
  }
}

class InAppNotificationStrategy implements NotificationStrategy {
  readonly channel = 'in-app';
  private static seq = 0;
  async send(p: NotificationPayload): Promise<NotificationResult> {
    const id = `inbox-${++InAppNotificationStrategy.seq}`;
    console.log(`  [in-app userId=${p.to}] ${p.subject} (inbox=${id})`);
    return { ok: true, channel: this.channel, reference: id };
  }
}

// ============ CONTEXTO ============
class NotificationService {
  constructor(private strategy: NotificationStrategy) {}
  setStrategy(s: NotificationStrategy) {
    this.strategy = s;
  }
  notify(p: NotificationPayload) {
    return this.strategy.send(p);
  }
}

// ============ DEMONSTRAÇÃO ============
async function main() {
  console.log('=== 1. Estratégia inicial: Console ===');
  const svc = new NotificationService(new ConsoleNotificationStrategy());
  await svc.notify({
    to: 'maria@email.com',
    subject: 'Doação reservada',
    body: 'A sua doação “Cesta básica completa” foi reservada por Esperança.',
  });

  console.log('\n=== 2. Troca em runtime: Email ===');
  svc.setStrategy(new EmailNotificationStrategy('contato@redesolidaria.org'));
  await svc.notify({
    to: 'carlos@email.com',
    subject: 'Voluntário a caminho',
    body: 'Ana vai retirar sua doação amanhã às 10h.',
  });

  console.log('\n=== 3. Troca para In-app ===');
  svc.setStrategy(new InAppNotificationStrategy());
  await svc.notify({
    to: 'usr_42',
    subject: 'Bem-vinda à Rede!',
    body: 'Conclua seu perfil para começar a doar.',
  });

  console.log('\n=== 4. Erro tratado pela estratégia (email inválido) ===');
  svc.setStrategy(new EmailNotificationStrategy());
  const r = await svc.notify({
    to: 'sem-arroba',
    subject: 'Vai falhar',
    body: '...',
  });
  console.log('   resultado:', r);
}

main().catch(console.error);
