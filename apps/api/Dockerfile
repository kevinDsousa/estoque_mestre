# apps/api/Dockerfile

# 1. Estágio de Dependências/Build
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Copia os manifestos do workspace
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY package.json .
COPY turbo.json .

# Copia o código-fonte
COPY packages/ packages/
COPY apps/api/ apps/api/

# Instala dependências
RUN pnpm install --frozen-lockfile

# Gera o cliente Prisma
RUN pnpm --filter api prisma generate

# RODA OS TESTES UNITÁRIOS da API
RUN pnpm turbo run test --filter=api

# Constrói apenas a aplicação 'api'
RUN pnpm turbo run build --filter=api


# 2. Estágio de Produção
FROM node:20-alpine AS runner

# Aplica atualizações de segurança na imagem base
RUN apk --no-cache upgrade

WORKDIR /app

# Copia apenas as dependências de produção do workspace
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Copia os artefatos construídos
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json .

EXPOSE 3000
CMD ["node", "dist/main"]