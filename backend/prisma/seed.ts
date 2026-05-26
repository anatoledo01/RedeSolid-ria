import { PrismaClient, Role, DonationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.deliveryRequest.deleteMany();
  await prisma.donationImage.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Dados existentes removidos');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Roupas', description: 'Roupas em bom estado', icon: '👕' },
    }),
    prisma.category.create({
      data: { name: 'Alimentos', description: 'Alimentos não perecíveis', icon: '🍎' },
    }),
    prisma.category.create({
      data: { name: 'Móveis', description: 'Móveis em bom estado', icon: '🪑' },
    }),
    prisma.category.create({
      data: { name: 'Eletrônicos', description: 'Equipamentos eletrônicos funcionando', icon: '💻' },
    }),
    prisma.category.create({
      data: { name: 'Livros', description: 'Livros e material de estudo', icon: '📚' },
    }),
    prisma.category.create({
      data: { name: 'Brinquedos', description: 'Brinquedos em bom estado', icon: '🧸' },
    }),
    prisma.category.create({
      data: { name: 'Higiene', description: 'Produtos de higiene pessoal', icon: '🧴' },
    }),
    prisma.category.create({
      data: { name: 'Outros', description: 'Outros tipos de doações', icon: '📦' },
    }),
  ]);

  console.log(`✅ ${categories.length} categorias criadas`);

  // Create users
  const hashedPassword = await bcrypt.hash('123456', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Rede Solidária',
      email: 'admin@redesolidaria.com',
      password: hashedPassword,
      role: Role.ADMIN,
      phone: '(11) 99999-0000',
      isApproved: true,
      isActive: true,
    },
  });

  const donor1 = await prisma.user.create({
    data: {
      name: 'Maria Silva',
      email: 'maria@email.com',
      password: hashedPassword,
      role: Role.DONOR,
      phone: '(11) 99999-1111',
      isApproved: true,
      isActive: true,
      addresses: {
        create: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01001-000',
          isDefault: true,
        },
      },
    },
  });

  const donor2 = await prisma.user.create({
    data: {
      name: 'Carlos Oliveira',
      email: 'carlos@email.com',
      password: hashedPassword,
      role: Role.DONOR,
      phone: '(21) 98888-2222',
      isApproved: true,
      isActive: true,
    },
  });

  const volunteer1 = await prisma.user.create({
    data: {
      name: 'Ana Santos',
      email: 'ana@email.com',
      password: hashedPassword,
      role: Role.VOLUNTEER,
      phone: '(11) 97777-3333',
      isApproved: true,
      isActive: true,
    },
  });

  const volunteer2 = await prisma.user.create({
    data: {
      name: 'Pedro Lima',
      email: 'pedro@email.com',
      password: hashedPassword,
      role: Role.VOLUNTEER,
      phone: '(31) 96666-4444',
      isApproved: false,
      isActive: true,
    },
  });

  const receiver1 = await prisma.user.create({
    data: {
      name: 'Instituição Esperança',
      email: 'esperanca@email.com',
      password: hashedPassword,
      role: Role.RECEIVER,
      phone: '(11) 95555-5555',
      isApproved: true,
      isActive: true,
      addresses: {
        create: {
          street: 'Av. da Solidariedade, 456',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '02002-000',
          isDefault: true,
        },
      },
    },
  });

  const receiver2 = await prisma.user.create({
    data: {
      name: 'João Pereira',
      email: 'joao@email.com',
      password: hashedPassword,
      role: Role.RECEIVER,
      phone: '(41) 94444-6666',
      isApproved: true,
      isActive: true,
    },
  });

  console.log('✅ 7 usuários criados');

  // Create donations
  const donation1 = await prisma.donation.create({
    data: {
      title: 'Roupas de inverno para crianças',
      description: 'Conjunto com 10 peças de roupas de inverno em ótimo estado, tamanhos variados para crianças de 2 a 8 anos.',
      quantity: 10,
      status: DonationStatus.AVAILABLE,
      locationText: 'Rua das Flores, 123 - Vila Mariana, São Paulo - SP',
      donorId: donor1.id,
      categoryId: categories[0].id,
    },
  });

  const donation2 = await prisma.donation.create({
    data: {
      title: 'Cesta básica completa',
      description: 'Cesta com arroz, feijão, macarrão, óleo, açúcar, café e leite. Tudo dentro do prazo de validade.',
      quantity: 3,
      status: DonationStatus.RESERVED,
      locationText: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      donorId: donor1.id,
      receiverId: receiver1.id,
      categoryId: categories[1].id,
    },
  });

  const donation3 = await prisma.donation.create({
    data: {
      title: 'Notebook usado funcionando',
      description: 'Notebook Dell Inspiron com 8GB RAM, HD 500GB. Funcionando perfeitamente, ideal para estudos.',
      quantity: 1,
      status: DonationStatus.DELIVERED,
      locationText: 'Rua da Tecnologia, 789 - Centro, Rio de Janeiro - RJ',
      donorId: donor2.id,
      receiverId: receiver1.id,
      categoryId: categories[3].id,
    },
  });

  const donation4 = await prisma.donation.create({
    data: {
      title: 'Livros didáticos ensino médio',
      description: 'Coleção completa de livros do ensino médio: matemática, português, história, geografia, física e química.',
      quantity: 12,
      status: DonationStatus.AVAILABLE,
      locationText: 'Rua do Saber, 321 - Pinheiros, São Paulo - SP',
      donorId: donor2.id,
      categoryId: categories[4].id,
    },
  });

  const donation5 = await prisma.donation.create({
    data: {
      title: 'Kit de higiene pessoal',
      description: 'Kit contendo sabonetes, shampoo, pasta de dente, escova dental e toalhas. Todos novos.',
      quantity: 20,
      status: DonationStatus.IN_TRANSIT,
      locationText: 'Av. Brasil, 500 - Centro, Belo Horizonte - MG',
      donorId: donor1.id,
      receiverId: receiver2.id,
      categoryId: categories[6].id,
    },
  });

  console.log('✅ 5 doações criadas');

  // Create delivery for in-transit donation
  await prisma.deliveryRequest.create({
    data: {
      donationId: donation5.id,
      volunteerId: volunteer1.id,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  // Create delivery for delivered donation
  await prisma.deliveryRequest.create({
    data: {
      donationId: donation3.id,
      volunteerId: volunteer1.id,
      status: 'DELIVERED',
      acceptedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ 2 entregas criadas');

  // Create review
  await prisma.review.create({
    data: {
      authorId: receiver1.id,
      targetId: donor2.id,
      donationId: donation3.id,
      rating: 5,
      comment: 'Excelente doador! Notebook em perfeito estado. Muito obrigado!',
    },
  });

  await prisma.review.create({
    data: {
      authorId: receiver1.id,
      targetId: volunteer1.id,
      donationId: donation3.id,
      rating: 5,
      comment: 'Voluntário muito atencioso e pontual na entrega!',
    },
  });

  console.log('✅ 2 avaliações criadas');

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'USER_APPROVED',
        entity: 'User',
        entityId: volunteer1.id,
        details: { userName: 'Ana Santos' },
      },
      {
        userId: donor1.id,
        action: 'DONATION_CREATED',
        entity: 'Donation',
        entityId: donation1.id,
        details: { title: 'Roupas de inverno para crianças' },
      },
      {
        userId: receiver1.id,
        action: 'DONATION_RESERVED',
        entity: 'Donation',
        entityId: donation2.id,
        details: { title: 'Cesta básica completa' },
      },
    ],
  });

  console.log('✅ 3 logs de auditoria criados');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('  Admin:      admin@redesolidaria.com / 123456');
  console.log('  Doador:     maria@email.com / 123456');
  console.log('  Doador 2:   carlos@email.com / 123456');
  console.log('  Voluntário: ana@email.com / 123456');
  console.log('  Recebedor:  esperanca@email.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
