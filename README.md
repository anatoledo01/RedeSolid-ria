# 🤝 Rede Solidária

**Sistema de Gestão de Doações** — Conectando solidariedade com quem mais precisa.

Plataforma full-stack que une doadores, recebedores e voluntários para transformar vidas através da generosidade e do cuidado coletivo.

## 🚀 Tecnologias

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **TailwindCSS v4**
- **Framer Motion**
- **Zustand** (State Management)
- **React Query** (Data Fetching)
- **Lucide Icons**
- **Sonner** (Toasts)

### Backend
- **NestJS 11**
- **TypeScript**
- **Prisma ORM 6**
- **PostgreSQL 16**
- **JWT** (Access + Refresh Tokens)
- **Passport.js**
- **Swagger/OpenAPI**
- **Multer** (Upload)
- **Helmet** + **Throttler** (Security)

### Infraestrutura
- **Docker Compose** (PostgreSQL)

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **npm** 9+
- **Docker** e **Docker Compose** (para PostgreSQL)

## ⚡ Quick Start

### 1. Clonar o repositório
```bash
git clone <repo-url>
cd Rede\ Solidária_Engenharia3
```

### 2. Subir o banco de dados
```bash
docker-compose up -d
```

### 3. Configurar o backend
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```
O backend estará rodando em `http://localhost:3001`  
Swagger docs: `http://localhost:3001/api/docs`

### 4. Configurar o frontend
```bash
cd frontend
npm install
npm run dev
```
O frontend estará rodando em `http://localhost:3000`

## 🔑 Credenciais de Demonstração

| Tipo | Email | Senha |
|------|-------|-------|
| **Admin** | admin@redesolidaria.com | 123456 |
| **Doador** | maria@email.com | 123456 |
| **Doador 2** | carlos@email.com | 123456 |
| **Voluntário** | ana@email.com | 123456 |
| **Recebedor** | esperanca@email.com | 123456 |

## 👥 Tipos de Usuários

### Administrador
- Dashboard com métricas
- Gestão de usuários (aprovar, bloquear)
- Gestão de doações e categorias
- Relatórios (exportar CSV)
- Logs de auditoria

### Doador
- Criar/editar doações
- Upload de fotos
- Acompanhar status
- Histórico de doações

### Voluntário
- Aceitar entregas
- Atualizar status de entrega
- Dashboard pessoal

### Recebedor
- Buscar doações disponíveis
- Reservar doações
- Histórico de recebimentos

## 🏗️ Arquitetura

```
├── docker-compose.yml
├── backend/
│   ├── prisma/          # Schema + Migrations + Seed
│   └── src/
│       ├── common/      # Guards, Decorators, Filters, Interceptors
│       ├── config/      # Configuration
│       ├── prisma/      # PrismaService
│       └── modules/     # Feature modules
│           ├── auth/
│           ├── users/
│           ├── donations/
│           ├── categories/
│           ├── deliveries/
│           ├── reviews/
│           ├── uploads/
│           └── admin/
└── frontend/
    └── src/
        ├── app/         # Next.js App Router pages
        ├── components/  # UI Components
        ├── hooks/       # Custom hooks
        ├── lib/         # Utilities
        ├── providers/   # React providers
        ├── services/    # API service layer
        ├── store/       # Zustand stores
        └── types/       # TypeScript types
```

## 📡 API Endpoints

| Módulo | Rota Base | Descrição |
|--------|-----------|-----------|
| Auth | `/api/auth` | Login, Register, Refresh, Logout |
| Users | `/api/users` | CRUD, Approve, Block |
| Donations | `/api/donations` | CRUD, Status, Reserve |
| Categories | `/api/categories` | CRUD (Admin) |
| Deliveries | `/api/deliveries` | Accept, Status |
| Reviews | `/api/reviews` | Create, List by donation |
| Uploads | `/api/uploads` | Image upload/delete |
| Admin | `/api/admin` | Dashboard, Reports, Logs |

Documentação completa: `http://localhost:3001/api/docs`

## 🎨 Design

- **Paleta**: Verde solidário + Azul confiança
- **Tema**: Dark/Light mode
- **Estilo**: Glassmorphism + Gradientes
- **Fontes**: Inter + Outfit (Google Fonts)
- **Animações**: Framer Motion

## 📄 Licença

Este projeto é de uso educacional.
