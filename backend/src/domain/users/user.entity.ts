/**
 * Hierarquia de domínio dos usuários da Rede Solidária.
 *
 * Aplica três pilares de Orientação a Objetos:
 *   - ENCAPSULAMENTO: campos sensíveis ficam private/protected; o
 *     mundo externo lê via getters e só altera via métodos de negócio
 *     que validam invariantes.
 *   - HERANÇA: AbstractUser concentra os atributos comuns (id, nome,
 *     email, hash da senha, datas) e as classes Admin/Donor/
 *     Volunteer/Receiver herdam e personalizam o comportamento.
 *   - POLIMORFISMO: cada subclasse sobrescreve canPerform() e
 *     getDashboardRoute() — quem usa AbstractUser não precisa saber
 *     qual subclasse está manipulando.
 */

import { Role } from '@prisma/client';

export type Action =
  | 'donation:create'
  | 'donation:reserve'
  | 'donation:moderate'
  | 'delivery:accept'
  | 'delivery:update-status'
  | 'review:write'
  | 'admin:dashboard'
  | 'admin:export-report'
  | 'admin:approve-user'
  | 'admin:block-user'
  | 'admin:audit-log';

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  avatar?: string | null;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class AbstractUser {
  // Encapsulamento: campos imutáveis a partir do construtor; quem
  // quiser ler usa getters; quem quiser alterar usa os métodos de
  // negócio (block(), approve(), updateProfile()).
  protected readonly _id: string;
  protected _name: string;
  protected readonly _email: string;
  protected readonly _passwordHash: string;
  protected _phone: string | null;
  protected _avatar: string | null;
  protected _isApproved: boolean;
  protected _isActive: boolean;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._phone = props.phone ?? null;
    this._avatar = props.avatar ?? null;
    this._isApproved = props.isApproved;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // ====== Getters (somente leitura) ======
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get phone(): string | null { return this._phone; }
  get avatar(): string | null { return this._avatar; }
  get isApproved(): boolean { return this._isApproved; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ====== Métodos abstratos (polimorfismo) ======
  abstract get role(): Role;

  /**
   * Decide se este usuário pode executar uma ação do sistema.
   * Sobrescrito em cada subclasse com a matriz de permissões.
   */
  abstract canPerform(action: Action): boolean;

  /**
   * Caminho do dashboard do papel — usado pelo frontend após login.
   */
  abstract getDashboardRoute(): string;

  // ====== Métodos de negócio comuns ======
  block(reason?: string): void {
    if (!this._isActive) {
      throw new Error(`Usuário ${this._email} já está bloqueado`);
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  unblock(): void {
    if (this._isActive) return;
    this._isActive = true;
    this._updatedAt = new Date();
  }

  approve(): void {
    if (this._isApproved) return;
    this._isApproved = true;
    this._updatedAt = new Date();
  }

  updateProfile(partial: { name?: string; phone?: string; avatar?: string }): void {
    if (partial.name?.trim()) this._name = partial.name.trim();
    if (partial.phone !== undefined) this._phone = partial.phone || null;
    if (partial.avatar !== undefined) this._avatar = partial.avatar || null;
    this._updatedAt = new Date();
  }

  /**
   * Disponibiliza um snapshot serializável (sem o hash da senha).
   * Útil para enviar ao frontend.
   */
  toPublicJSON(): Omit<UserProps, 'passwordHash'> & { role: Role } {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      role: this.role,
      phone: this._phone,
      avatar: this._avatar,
      isApproved: this._isApproved,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

// =============================================================
// Subclasses concretas (uma por papel)
// =============================================================

export class Admin extends AbstractUser {
  get role(): Role { return Role.ADMIN; }

  canPerform(action: Action): boolean {
    // Admin pode tudo — exceto agir como recebedor/voluntário.
    const blocked: Action[] = ['donation:reserve', 'delivery:accept'];
    return !blocked.includes(action) && this._isActive;
  }

  getDashboardRoute(): string {
    return '/admin';
  }
}

export class Donor extends AbstractUser {
  get role(): Role { return Role.DONOR; }

  canPerform(action: Action): boolean {
    if (!this._isActive) return false;
    const allowed: Action[] = [
      'donation:create',
      'review:write',
    ];
    return allowed.includes(action);
  }

  getDashboardRoute(): string {
    return '/donor';
  }
}

export class Volunteer extends AbstractUser {
  get role(): Role { return Role.VOLUNTEER; }

  canPerform(action: Action): boolean {
    if (!this._isActive) return false;
    // Voluntário precisa estar aprovado pelo admin para aceitar entregas
    if (!this._isApproved && action === 'delivery:accept') return false;
    const allowed: Action[] = [
      'delivery:accept',
      'delivery:update-status',
      'review:write',
    ];
    return allowed.includes(action);
  }

  getDashboardRoute(): string {
    return '/volunteer';
  }
}

export class Receiver extends AbstractUser {
  get role(): Role { return Role.RECEIVER; }

  canPerform(action: Action): boolean {
    if (!this._isActive) return false;
    const allowed: Action[] = [
      'donation:reserve',
      'review:write',
    ];
    return allowed.includes(action);
  }

  getDashboardRoute(): string {
    return '/receiver';
  }
}

// =============================================================
// Factory — converte a entidade do Prisma para a classe correta
// =============================================================

import type { User as PrismaUser } from '@prisma/client';

export class UserFactory {
  static fromPrisma(record: PrismaUser): AbstractUser {
    const props: UserProps = {
      id: record.id,
      name: record.name,
      email: record.email,
      passwordHash: record.password,
      phone: record.phone,
      avatar: record.avatar,
      isApproved: record.isApproved,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    switch (record.role) {
      case Role.ADMIN:     return new Admin(props);
      case Role.DONOR:     return new Donor(props);
      case Role.VOLUNTEER: return new Volunteer(props);
      case Role.RECEIVER:  return new Receiver(props);
      default:
        throw new Error(`Role desconhecido: ${record.role}`);
    }
  }
}
