# apps/front/Dockerfile

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
COPY apps/front/ apps/front/

# Instala dependências
RUN pnpm install --frozen-lockfile

# RODA OS TESTES UNITÁRIOS do Front-end
RUN pnpm turbo run test --filter=front

# Constrói apenas a aplicação 'front' e suas dependências
RUN pnpm turbo run build --filter=front


# 2. Estágio de Produção (Servidor Web)
FROM nginx:stable-alpine

# Aplica atualizações de segurança na imagem base
RUN apk --no-cache upgrade

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos construídos
COPY --from=builder /app/apps/front/dist/front/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]