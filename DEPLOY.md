# 🚀 Deploy — Rede Solidária

Guia passo a passo para subir o **backend NestJS no Render** e o
**frontend Next.js no Netlify**. Tudo automatizado por `render.yaml` e
`netlify.toml` que já estão neste repositório.

> **Pré-requisito**: este PR já mergeado na `main`, e o PR
> `feat/oo-and-design-patterns` também mergeado antes (caso ainda não
> esteja).

---

## 1. Backend → Render

### 1.1 Provisionamento

1. Entre no [Render Dashboard](https://dashboard.render.com/).
2. **New → Blueprint**.
3. Conecte o repositório `anatoledo01/RedeSolid-ria`.
4. O Render detecta o `render.yaml` e propõe criar:
   - `rede-solidaria-db` — PostgreSQL 16 free
   - `rede-solidaria-api` — Web service NestJS free
5. **Apply** — a provisão leva ~3-5 minutos.

### 1.2 O que acontece automaticamente

- **Build**: `npm ci && npx prisma generate && npm run build`
- **Pre-deploy** (idempotente):
  - `npx prisma db push --accept-data-loss` — aplica o schema
  - `npx ts-node prisma/bootstrap.ts` — popula com seed se o banco
    estiver vazio; do contrário, não faz nada
- **Start**: `node dist/src/main.js`
- **Health check**: `/api/docs` (Swagger UI)

### 1.3 Variáveis de ambiente já configuradas

| Variável | Origem |
|---|---|
| `DATABASE_URL` | injetada pelo serviço `rede-solidaria-db` |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | geradas pelo Render no 1º deploy |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | `15m` / `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (padrão Render) |
| `FRONTEND_URL` | placeholder — **atualize após o deploy do Netlify** |

### 1.4 Após o deploy

A URL ficará algo como `https://rede-solidaria-api.onrender.com`.

- Swagger: `https://rede-solidaria-api.onrender.com/api/docs`
- Healthcheck: o próprio Swagger

**Anote essa URL** — vai precisar dela no Netlify.

---

## 2. Frontend → Netlify

### 2.1 Provisionamento

1. Entre no [Netlify Dashboard](https://app.netlify.com/).
2. **Add new site → Import an existing project → GitHub**.
3. Selecione o repositório `anatoledo01/RedeSolid-ria`.
4. O Netlify detecta o `netlify.toml`. Confirme:
   - Base: `frontend`
   - Build: `npm ci && npm run build`
   - Publish: `frontend/.next`
5. **Antes de clicar em Deploy**, abra "Add environment variables" e
   adicione:

   ```
   NEXT_PUBLIC_API_URL = https://rede-solidaria-api.onrender.com/api
   ```

   (use a URL real anotada na seção 1.4)

6. **Deploy site**.

### 2.2 Após o deploy

A URL ficará algo como `https://redesolidaria.netlify.app` (ou um
nome random — você pode renomear em **Site settings → Change site
name**).

---

## 3. Cruzando as URLs (CORS)

Por padrão o backend só aceita requisições da `FRONTEND_URL`. Agora
que o Netlify tem uma URL definitiva:

1. Volte no [Render Dashboard](https://dashboard.render.com/) →
   `rede-solidaria-api` → **Environment**.
2. Edite `FRONTEND_URL` para a URL do Netlify (ex.:
   `https://redesolidaria.netlify.app`, sem `/` no final).
3. **Save Changes** — o backend reinicia sozinho em ~30s.

Pronto. Frontend conversando com backend, banco populado.

---

## 4. Credenciais de demonstração

Após o seed, os logins disponíveis são:

| Tipo | Email | Senha |
|---|---|---|
| Admin | `admin@redesolidaria.com` | `123456` |
| Doador | `maria@email.com` | `123456` |
| Doador 2 | `carlos@email.com` | `123456` |
| Voluntário | `ana@email.com` | `123456` |
| Recebedor | `esperanca@email.com` | `123456` |

---

## 5. Avisos importantes

- **Plano free do Render**: o serviço web hiberna após 15min de
  inatividade — a primeira request depois disso demora ~30s para
  acordar. Para apresentações ao vivo, abra o Swagger 1min antes.
- **Postgres free do Render**: o banco gratuito **expira após 30 dias**
  da criação. Para projeto acadêmico de 4 quinzenas isso é suficiente,
  mas anote a data.
- **Reseedar o banco em produção**: vá em Render → Web service →
  **Shell** e rode `npx ts-node prisma/seed.ts`. **Cuidado**: o seed
  apaga tudo antes de inserir.
- **Logs**: o Render mostra os logs em tempo real na aba **Logs** do
  serviço.

---

## 6. Resolvendo problemas

### Backend builda mas trava no startup
Verifique os logs do Render. Causas comuns:
- `DATABASE_URL` mal-formada → confira a aba Environment.
- Falta o `prisma generate` → o `buildCommand` do `render.yaml` já
  inclui; se trocou, garanta que está rodando antes do `build`.

### Frontend dá CORS no console do browser
Significa que a `FRONTEND_URL` do backend não é a URL real do Netlify.
Volte para a seção 3.

### Frontend mostra "Network Error" em todas as chamadas
Provavelmente o `NEXT_PUBLIC_API_URL` no Netlify está errado ou o
backend está hibernando (primeira request depois de 15min). Aguarde
30s e tente de novo.
