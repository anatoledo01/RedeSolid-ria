/**
 * Padrão STRATEGY aplicado a notificações.
 *
 * Cada canal (email, in-app, console) é uma implementação intercambiável
 * de NotificationStrategy. O NotificationService recebe a estratégia
 * desejada em runtime — não precisa conhecer detalhes de cada canal.
 *
 * Vantagens neste projeto:
 *   - dá pra adicionar Push/SMS/Webhook sem mexer nas chamadas
 *     existentes (donations, deliveries, admin)
 *   - testes ficam triviais (basta um FakeStrategy que registra em memória)
 *   - em dev usamos ConsoleStrategy; em prod, EmailStrategy + InAppStrategy
 */

import { Logger } from '@nestjs/common';

export interface NotificationPayload {
  to: string;            // email / userId / phone, depende do canal
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  ok: boolean;
  channel: string;
  reference?: string;    // id externo (Mailgun, SES, OneSignal...)
  error?: string;
}

/** Contrato comum — toda estratégia precisa implementar isso. */
export interface NotificationStrategy {
  readonly channel: string;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}

// =============================================================
// ESTRATÉGIA 1 — Console (default em desenvolvimento)
// =============================================================
export class ConsoleNotificationStrategy implements NotificationStrategy {
  readonly channel = 'console';
  private readonly logger = new Logger('Notification:console');

  async send(p: NotificationPayload): Promise<NotificationResult> {
    this.logger.log(`[→ ${p.to}] ${p.subject}\n${p.body}`);
    return { ok: true, channel: this.channel, reference: `console-${Date.now()}` };
  }
}

// =============================================================
// ESTRATÉGIA 2 — Email (simulada — basta plugar SES/SendGrid)
// =============================================================
export class EmailNotificationStrategy implements NotificationStrategy {
  readonly channel = 'email';
  private readonly logger = new Logger('Notification:email');

  constructor(
    private readonly config: { fromAddress: string; provider: 'ses' | 'sendgrid' } =
      { fromAddress: 'no-reply@redesolidaria.org', provider: 'ses' },
  ) {}

  async send(p: NotificationPayload): Promise<NotificationResult> {
    if (!p.to.includes('@')) {
      return { ok: false, channel: this.channel, error: 'destinatário inválido' };
    }
    // Aqui entraria a chamada real ao provedor. Stub para a 1ª versão:
    this.logger.log(
      `[${this.config.provider.toUpperCase()}] de ${this.config.fromAddress} ` +
      `para ${p.to}: ${p.subject}`,
    );
    return {
      ok: true,
      channel: this.channel,
      reference: `${this.config.provider}-${Date.now()}`,
    };
  }
}

// =============================================================
// ESTRATÉGIA 3 — In-app (grava na própria base p/ aparecer no sino)
// =============================================================
export class InAppNotificationStrategy implements NotificationStrategy {
  readonly channel = 'in-app';
  private readonly logger = new Logger('Notification:in-app');

  constructor(private readonly inbox: InAppInbox) {}

  async send(p: NotificationPayload): Promise<NotificationResult> {
    const entry = await this.inbox.save({
      userId: p.to,
      subject: p.subject,
      body: p.body,
      createdAt: new Date(),
    });
    this.logger.log(`Inbox ← ${p.to}: ${p.subject}`);
    return { ok: true, channel: this.channel, reference: entry.id };
  }
}

/** Pequena interface auxiliar (em prod, viraria um Prisma repository). */
export interface InAppInbox {
  save(data: { userId: string; subject: string; body: string; createdAt: Date }):
    Promise<{ id: string }>;
}

// =============================================================
// CONTEXTO — usa qualquer estratégia que respeite o contrato
// =============================================================
export class NotificationService {
  constructor(private strategy: NotificationStrategy) {}

  /** Permite trocar a estratégia em runtime — essência do Strategy. */
  setStrategy(strategy: NotificationStrategy) {
    this.strategy = strategy;
  }

  async notify(payload: NotificationPayload): Promise<NotificationResult> {
    return this.strategy.send(payload);
  }

  /**
   * Pequeno helper para enviar em vários canais sequencialmente,
   * usando o registry interno (lista de estratégias).
   */
  static async broadcast(
    payload: NotificationPayload,
    strategies: NotificationStrategy[],
  ): Promise<NotificationResult[]> {
    return Promise.all(strategies.map((s) => s.send(payload)));
  }
}
