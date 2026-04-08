

# ── BASE: Node LTS Alpine (imagem mínima compartilhada) ───────
FROM node:22-alpine AS base

# Dependências nativas necessárias para bcryptjs, Prisma, etc.
RUN  apk add --no-cache \
    libc6-compat \
    openssl \
    dumb-init

WORKDIR /app

# Copia apenas os manifestos de dependência primeiro
# (aproveitamento máximo de cache — só reinstala se esses mudarem)
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma

# ── DEPS: Instala TODAS as dependências (dev + prod) ──────────
FROM base AS deps

RUN npm install --omit=dev

# Gera o Prisma Client (necessário antes do build)
RUN npx prisma generate

# ── BUILDER: Compila TypeScript ───────────────────────────────
FROM deps AS builder

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build

# Verifica que o build gerou os arquivos esperados
RUN test -f dist/main.js || (echo "❌ Build falhou — dist/main.js não encontrado" && exit 1)

# Remove devDependencies para a imagem final
RUN npm prune --omit=dev

# ── PRODUCTION: Imagem final mínima ──────────────────────────
FROM node:20-alpine AS production

LABEL maintainer="seu@email.com"
LABEL org.opencontainers.image.title="E-commerce Gamer API"
LABEL org.opencontainers.image.description="Backend NestJS para e-commerce gamer"

# Dependências de runtime apenas
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    dumb-init \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

WORKDIR /app

# Copia apenas o necessário para rodar em produção
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Variáveis de ambiente padrão (valores reais vêm de secrets/env no deploy)
ENV NODE_ENV=production \
    PORT=7000

# Usuário não-root por segurança
USER nestjs

EXPOSE 7000

# Health check — verifica se a API está respondendo
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

# dumb-init garante tratamento correto de sinais (SIGTERM → graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

# Executa migrations e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

# ── DEVELOPMENT: Hot-reload com ts-node ───────────────────────
FROM deps AS development

WORKDIR /app

# Copia todo o código-fonte
COPY tsconfig*.json ./
COPY src ./src
COPY prisma ./prisma

ENV NODE_ENV=development \
    PORT=7000

EXPOSE 7000
# Porta de debug Node.js
EXPOSE 9229

# dumb-init para sinais corretos no dev também
ENTRYPOINT ["dumb-init", "--"]

# Hot-reload com nest start --watch
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate dev --skip-seed && npm run start:dev"]