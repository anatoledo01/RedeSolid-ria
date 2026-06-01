/**
 * Demonstração executável da hierarquia de usuários.
 * Roda com: npx ts-node demo_usuarios.ts
 *
 * NOTA: este arquivo é uma cópia auto-contida (não depende do
 * Prisma). A versão integrada ao backend fica em:
 *   backend/src/domain/users/user.entity.ts
 */

// ============== TIPOS ==============
type Role = 'ADMIN' | 'DONOR' | 'VOLUNTEER' | 'RECEIVER';

type Action =
  | 'donation:create'
  | 'donation:reserve'
  | 'delivery:accept'
  | 'review:write'
  | 'admin:dashboard';

interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============== CLASSE ABSTRATA (HERANÇA + ENCAPSULAMENTO) ==============
abstract class AbstractUser {
  // ENCAPSULAMENTO: campos protected/readonly — só mutados via métodos.
  protected readonly _id: string;
  protected _name: string;
  protected readonly _email: string;
  protected readonly _passwordHash: string;
  protected _isApproved: boolean;
  protected _isActive: boolean;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor(p: UserProps) {
    this._id = p.id;
    this._name = p.name;
    this._email = p.email;
    this._passwordHash = p.passwordHash;
    this._isApproved = p.isApproved;
    this._isActive = p.isActive;
    this._createdAt = p.createdAt;
    this._updatedAt = p.updatedAt;
  }

  // Getters públicos
  get id() { return this._id; }
  get name() { return this._name; }
  get email() { return this._email; }
  get isApproved() { return this._isApproved; }
  get isActive() { return this._isActive; }

  // POLIMORFISMO: cada subclasse implementa role/canPerform/dashboard
  abstract get role(): Role;
  abstract canPerform(action: Action): boolean;
  abstract getDashboardRoute(): string;

  // Métodos compartilhados (herdados)
  block() {
    if (!this._isActive)
      throw new Error(`${this._email} já está bloqueado`);
    this._isActive = false;
    this._updatedAt = new Date();
  }
  approve() {
    this._isApproved = true;
    this._updatedAt = new Date();
  }
}

// ============== SUBCLASSES ==============
class Admin extends AbstractUser {
  get role(): Role { return 'ADMIN'; }
  canPerform(action: Action): boolean {
    if (!this._isActive) return false;
    return action !== 'donation:reserve' && action !== 'delivery:accept';
  }
  getDashboardRoute() { return '/admin'; }
}

class Donor extends AbstractUser {
  get role(): Role { return 'DONOR'; }
  canPerform(action: Action): boolean {
    if (!this._isActive) return false;
    return action === 'donation:create' || action === 'review:write';
  }
  getDashboardRoute() { return '/donor'; }
}

class Volunteer extends AbstractUser {
  get role(): Role { return 'VOLUNTEER'; }
  canPerform(action: Action): boolean {
    if (!this._isActive) return false;
    if (!this._isApproved && action === 'delivery:accept') return false;
    return action === 'delivery:accept' || action === 'review:write';
  }
  getDashboardRoute() { return '/volunteer'; }
}

class Receiver extends AbstractUser {
  get role(): Role { return 'RECEIVER'; }
  canPerform(action: Action): boolean {
    if (!this._isActive) return false;
    return action === 'donation:reserve' || action === 'review:write';
  }
  getDashboardRoute() { return '/receiver'; }
}

// ============== DEMONSTRAÇÃO ==============
const baseProps = {
  passwordHash: '<hash>',
  isApproved: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const usuarios: AbstractUser[] = [
  new Admin({ ...baseProps, id: '1', name: 'Jonas (admin)',
              email: 'jonas@ong.org' }),
  new Donor({ ...baseProps, id: '2', name: 'Maria (doadora)',
              email: 'maria@email.com' }),
  // Voluntário NÃO aprovado:
  new Volunteer({ ...baseProps, isApproved: false, id: '3',
                  name: 'Ana (voluntária, pendente)',
                  email: 'ana@email.com' }),
  new Receiver({ ...baseProps, id: '4',
                 name: 'Esperança (recebedora)',
                 email: 'esp@ong.org' }),
];

console.log('\n=== Polimorfismo: cada subclasse responde diferente ===');
for (const u of usuarios) {
  console.log(
    `${u.role.padEnd(10)} | ${u.name.padEnd(32)} | ` +
    `dashboard=${u.getDashboardRoute()}`
  );
}

console.log('\n=== Matriz de permissões (canPerform) ===');
const actions: Action[] = [
  'donation:create',
  'donation:reserve',
  'delivery:accept',
  'review:write',
  'admin:dashboard',
];
console.log(
  'role'.padEnd(11),
  ...actions.map(a => a.padEnd(18)),
);
for (const u of usuarios) {
  console.log(
    u.role.padEnd(11),
    ...actions.map(a => (u.canPerform(a) ? '✓' : '✗').padEnd(18)),
  );
}

console.log('\n=== Encapsulamento: não dá pra mexer no _isActive direto ===');
// Tentativa fora da classe seria erro de compilação:
//   usuarios[0]._isActive = false;  // TS2445: Property '_isActive' is protected
// Quem quer alterar tem que passar pelos métodos block()/unblock().
console.log('Maria está ativa?', usuarios[1].isActive);
usuarios[1].block();
console.log('Após block(): Maria ainda ativa?', usuarios[1].isActive);

console.log('\n=== Polimorfismo: voluntário aprovado vs. não aprovado ===');
const anaPendente = usuarios[2];
console.log(`${anaPendente.name} pode aceitar entrega?`,
  anaPendente.canPerform('delivery:accept'));
anaPendente.approve();
console.log(`Depois de aprovar:`,
  anaPendente.canPerform('delivery:accept'));
