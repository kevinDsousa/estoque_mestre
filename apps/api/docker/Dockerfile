# Use a imagem base oficial do Node.js
FROM node:20-alpine

# Defina o diretório de trabalho no contêiner
WORKDIR /app

# Copie o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do projeto
RUN npm ci

# Copie o restante do código da aplicação para o diretório de trabalho
COPY . .

# Compile o projeto NestJS
RUN npm run build

# Exponha a porta que a aplicação irá rodar
EXPOSE 8080

# Comando para iniciar a aplicação
# Dependências do sistema necessárias pelo Prisma em Alpine
RUN apk add --no-cache openssl libc6-compat

# Instala o Prisma CLI globalmente para executar migrações em runtime
RUN npm i -g prisma@6.5.0

# Executa migrações do Prisma no start e inicia a aplicação
CMD ["sh", "-c", "prisma migrate deploy && npm run start:prod"]
