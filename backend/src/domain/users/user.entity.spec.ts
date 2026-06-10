/**
 * Testes da hierarquia OO de Usuários.
 *
 * Cobre os três pilares:
 *   - HERANÇA      → block/approve em qualquer subclasse
 *   - POLIMORFISMO → canPerform e getDashboardRoute por papel
 *   - ENCAPSULAMENTO → toPublicJSON não vaza passwordHash;
 *                       state interno protected
 */

import { Role } from '@prisma/client';
import {
  AbstractUser,
  Admin,
  Donor,
  Volunteer,
  Receiver,
  UserFactory,
  UserProps,
  Action,
} from './user.entity';

const baseProps: Omit<UserProps, 'id' | 'name' | 'email'> = {
  passwordHash: '<hash>',
  phone: null,
  avatar: null,
  isApproved: true,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function makeProps(overrides: Partial<UserProps> = {}): UserProps {
  return {
    id: 'u-1',
    name: 'Default',
    email: 'default@example.com',
    ...baseProps,
    ...overrides,
  };
}

// =============================================================
// Herança e estado básico
// =============================================================
describe('AbstractUser — herança', () => {
  it('expõe getters herdados em todas as subclasses', () => {
    const subclasses: AbstractUser[] = [
      new Admin(makeProps({ name: 'A', email: 'a@x.com' })),
      new Donor(makeProps({ name: 'D', email: 'd@x.com' })),
      new Volunteer(makeProps({ name: 'V', email: 'v@x.com' })),
      new Receiver(makeProps({ name: 'R', email: 'r@x.com' })),
    ];
    for (const u of subclasses) {
      expect(u.id).toBe('u-1');
      expect(u.email).toBeDefined();
      expect(u.isActive).toBe(true);
      expect(u.isApproved).toBe(true);
    }
  });

  it('block() altera estado e atualiza updatedAt; bloqueio duplo lança', () => {
    const u = new Donor(makeProps());
    const before = u.updatedAt;
    u.block();
    expect(u.isActive).toBe(false);
    expect(u.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    expect(() => u.block()).toThrow(/já está bloqueado/);
  });

  it('approve() é idempotente e seguro mesmo já aprovado', () => {
    const u = new Volunteer(makeProps({ isApproved: false }));
    expect(u.isApproved).toBe(false);
    u.approve();
    expect(u.isApproved).toBe(true);
    expect(() => u.approve()).not.toThrow();
  });

  it('updateProfile sanitiza name vazio (não sobrescreve)', () => {
    const u = new Donor(makeProps({ name: 'Original' }));
    u.updateProfile({ name: '   ' });
    expect(u.name).toBe('Original');
    u.updateProfile({ name: 'Novo' });
    expect(u.name).toBe('Novo');
  });
});

// =============================================================
// Polimorfismo
// =============================================================
describe('Polimorfismo — canPerform e getDashboardRoute por papel', () => {
  const actions: Action[] = [
    'donation:create',
    'donation:reserve',
    'donation:moderate',
    'delivery:accept',
    'delivery:update-status',
    'review:write',
    'admin:dashboard',
    'admin:export-report',
    'admin:approve-user',
    'admin:block-user',
    'admin:audit-log',
  ];

  it('Admin pode tudo, exceto reservar/aceitar entrega', () => {
    const admin = new Admin(makeProps());
    for (const a of actions) {
      if (a === 'donation:reserve' || a === 'delivery:accept') {
        expect(admin.canPerform(a)).toBe(false);
      } else {
        expect(admin.canPerform(a)).toBe(true);
      }
    }
    expect(admin.role).toBe(Role.ADMIN);
    expect(admin.getDashboardRoute()).toBe('/admin');
  });

  it('Donor só pode criar doação e avaliar', () => {
    const donor = new Donor(makeProps());
    expect(donor.canPerform('donation:create')).toBe(true);
    expect(donor.canPerform('review:write')).toBe(true);
    expect(donor.canPerform('donation:reserve')).toBe(false);
    expect(donor.canPerform('delivery:accept')).toBe(false);
    expect(donor.canPerform('admin:dashboard')).toBe(false);
    expect(donor.role).toBe(Role.DONOR);
    expect(donor.getDashboardRoute()).toBe('/donor');
  });

  it('Volunteer não-aprovado não pode aceitar entrega', () => {
    const v = new Volunteer(makeProps({ isApproved: false }));
    expect(v.canPerform('delivery:accept')).toBe(false);
    expect(v.canPerform('review:write')).toBe(true);

    v.approve();
    expect(v.canPerform('delivery:accept')).toBe(true);
    expect(v.canPerform('delivery:update-status')).toBe(true);
    expect(v.role).toBe(Role.VOLUNTEER);
    expect(v.getDashboardRoute()).toBe('/volunteer');
  });

  it('Receiver só pode reservar e avaliar', () => {
    const r = new Receiver(makeProps());
    expect(r.canPerform('donation:reserve')).toBe(true);
    expect(r.canPerform('review:write')).toBe(true);
    expect(r.canPerform('donation:create')).toBe(false);
    expect(r.canPerform('delivery:accept')).toBe(false);
    expect(r.role).toBe(Role.RECEIVER);
    expect(r.getDashboardRoute()).toBe('/receiver');
  });

  it('usuário bloqueado não passa nenhuma ação (todas as subclasses)', () => {
    const cases = [Admin, Donor, Volunteer, Receiver];
    for (const Cls of cases) {
      const u = new Cls(makeProps({ isActive: false }));
      for (const a of actions) {
        expect(u.canPerform(a)).toBe(false);
      }
    }
  });
});

// =============================================================
// Encapsulamento
// =============================================================
describe('Encapsulamento', () => {
  it('toPublicJSON não vaza passwordHash', () => {
    const u = new Donor(makeProps({
      passwordHash: 'super-secret-hash',
    }));
    const json = u.toPublicJSON();
    expect(json).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(json)).not.toContain('super-secret-hash');
    expect(json.role).toBe(Role.DONOR);
  });

  it('campos internos são protected — só métodos mutam o estado', () => {
    // Tentar mexer no _isActive diretamente é erro de compilação;
    // em runtime, a única forma de chegar lá é via block/unblock.
    const u = new Donor(makeProps());
    expect(u.isActive).toBe(true);
    u.block();
    expect(u.isActive).toBe(false);
    u.unblock();
    expect(u.isActive).toBe(true);
  });
});

// =============================================================
// UserFactory
// =============================================================
describe('UserFactory.fromPrisma', () => {
  function prismaRow(role: Role) {
    return {
      id: 'u-x',
      name: 'X',
      email: 'x@x.com',
      password: 'hash',
      role,
      phone: null,
      avatar: null,
      isApproved: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  it('despacha para a subclasse correta com base no role', () => {
    expect(UserFactory.fromPrisma(prismaRow(Role.ADMIN)))
      .toBeInstanceOf(Admin);
    expect(UserFactory.fromPrisma(prismaRow(Role.DONOR)))
      .toBeInstanceOf(Donor);
    expect(UserFactory.fromPrisma(prismaRow(Role.VOLUNTEER)))
      .toBeInstanceOf(Volunteer);
    expect(UserFactory.fromPrisma(prismaRow(Role.RECEIVER)))
      .toBeInstanceOf(Receiver);
  });

  it('mapeia password → passwordHash internamente', () => {
    const u = UserFactory.fromPrisma(prismaRow(Role.DONOR));
    // passwordHash é protected — só observamos através do JSON público
    expect(u.toPublicJSON()).not.toHaveProperty('passwordHash');
    expect(u.toPublicJSON()).not.toHaveProperty('password');
  });
});
