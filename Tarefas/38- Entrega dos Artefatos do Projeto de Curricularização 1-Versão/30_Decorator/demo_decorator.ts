/**
 * Demonstração standalone do padrão DECORATOR.
 * Rodar com: npx ts-node demo_decorator.ts
 *
 * A versão real está em
 * backend/src/domain/decorators/donation-repository.ts e pode envolver
 * o PrismaDonationRepository com Audit + Timing + Cache.
 */

// ============ MODELO ============
type DonationStatus = 'AVAILABLE' | 'RESERVED' | 'DELIVERED';

interface Donation {
  id: string;
  title: string;
  status: DonationStatus;
}

// ============ Component ============
interface DonationRepository {
  findOne(id: string): Promise<Donation | null>;
  updateStatus(id: string, status: DonationStatus): Promise<Donation>;
}

// ============ ConcreteComponent ============
class InMemoryDonationRepository implements DonationRepository {
  private data = new Map<string, Donation>([
    ['d-101', { id: 'd-101', title: 'Cesta básica completa', status: 'AVAILABLE' }],
    ['d-102', { id: 'd-102', title: 'Cobertor de inverno',  status: 'AVAILABLE' }],
  ]);

  async findOne(id: string): Promise<Donation | null> {
    await new Promise(r => setTimeout(r, 30));   // simula latência
    return this.data.get(id) ?? null;
  }
  async updateStatus(id: string, status: DonationStatus): Promise<Donation> {
    const cur = await this.findOne(id);
    if (!cur) throw new Error(`Doação ${id} não existe`);
    const updated = { ...cur, status };
    this.data.set(id, updated);
    return updated;
  }
}

// ============ Decorator base ============
abstract class DonationRepositoryDecorator implements DonationRepository {
  constructor(protected inner: DonationRepository) {}
  findOne(id: string)            { return this.inner.findOne(id); }
  updateStatus(id: string, s: DonationStatus) { return this.inner.updateStatus(id, s); }
}

// ============ Concrete Decorators ============
class TimingDecorator extends DonationRepositoryDecorator {
  async findOne(id: string) {
    const t0 = Date.now();
    const r = await super.findOne(id);
    console.log(`  [timing]  findOne(${id}) levou ${Date.now() - t0}ms`);
    return r;
  }
}

class CacheDecorator extends DonationRepositoryDecorator {
  private cache = new Map<string, Donation>();
  async findOne(id: string) {
    if (this.cache.has(id)) {
      console.log(`  [cache]   HIT  ${id}`);
      return this.cache.get(id) ?? null;
    }
    console.log(`  [cache]   MISS ${id}`);
    const r = await super.findOne(id);
    if (r) this.cache.set(id, r);
    return r;
  }
  async updateStatus(id: string, s: DonationStatus) {
    const r = await super.updateStatus(id, s);
    this.cache.delete(id);
    console.log(`  [cache]   invalidado ${id}`);
    return r;
  }
}

class AuditDecorator extends DonationRepositoryDecorator {
  async updateStatus(id: string, s: DonationStatus) {
    const r = await super.updateStatus(id, s);
    console.log(
      `  [audit]   AuditLog: action=donation:${s.toLowerCase()} ` +
      `entityId=${id}`
    );
    return r;
  }
}

// ============ DEMO ============
async function main() {
  const base   = new InMemoryDonationRepository();
  const cached = new CacheDecorator(base);
  const timed  = new TimingDecorator(cached);
  const repo   = new AuditDecorator(timed);   // pilha externa

  console.log('=== 1ª leitura (passa pelos 4) ===');
  console.log(await repo.findOne('d-101'));

  console.log('\n=== 2ª leitura (cache hit) ===');
  console.log(await repo.findOne('d-101'));

  console.log('\n=== updateStatus → invalida cache + audit ===');
  console.log(await repo.updateStatus('d-101', 'RESERVED'));

  console.log('\n=== 3ª leitura após update (cache miss de novo) ===');
  console.log(await repo.findOne('d-101'));
}

main().catch(console.error);
