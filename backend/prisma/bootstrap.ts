/**
 * Bootstrap idempotente do banco — roda no `preDeployCommand` do Render.
 *
 * - No PRIMEIRO deploy: o banco está vazio → executa o seed completo.
 * - Em deploys SUBSEQUENTES: o banco já tem usuários → não faz nada.
 *
 * Isso evita que cada novo deploy apague e re-popule os dados de
 * produção (o seed original chama deleteMany em tudo).
 *
 * Para reseedar manualmente em produção: use a aba "Shell" do Render e
 * rode `npx ts-node prisma/seed.ts`.
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [bootstrap] Verificando estado do banco...');

  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log(
      `✅ [bootstrap] Banco já tem ${userCount} usuário(s) — pulando seed.`,
    );
    return;
  }

  console.log('📦 [bootstrap] Banco vazio. Rodando seed inicial...\n');

  // Roda o seed como subprocesso para que a saída apareça no log do
  // deploy e quaisquer process.exit() não derrubem este wrapper.
  const seedPath = path.join(__dirname, 'seed.ts');
  execSync(`npx ts-node "${seedPath}"`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
}

main()
  .catch((err) => {
    console.error('❌ [bootstrap] erro:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
