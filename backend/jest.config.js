/** Configuração Jest do backend Rede Solidária. */
module.exports = {
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: {
        isolatedModules: true,
        // Mesmas flags do tsconfig de build, sem strict-mode que
        // dificultaria os mocks dos testes.
        target: 'ES2021',
        module: 'commonjs',
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    }],
  },
  testEnvironment: 'node',
  // Não fazemos resolução de paths com tsconfig-paths — todos os
  // testes usam paths relativos (./../). Mantém setup simples.
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/modules/**/*.service.ts',
  ],
  coverageDirectory: 'coverage',
  // Os testes do domínio são puros (sem NestJS) — não precisam de
  // setup global.
};
