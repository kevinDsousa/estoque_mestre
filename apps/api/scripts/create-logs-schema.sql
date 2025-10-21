-- Script para criar o schema logs-nodex
-- Este schema será usado exclusivamente para armazenar dados de logs e auditoria

-- Criar o schema logs-nodex
CREATE SCHEMA IF NOT EXISTS "logs-nodex";

-- Conceder permissões para o usuário postgres
GRANT ALL PRIVILEGES ON SCHEMA "logs-nodex" TO postgres;

-- Criar extensão uuid-ossp no schema logs-nodex se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "logs-nodex";

-- Comentário sobre o schema
COMMENT ON SCHEMA "logs-nodex" IS 'Schema dedicado para armazenamento de logs e auditoria do sistema Nodex';
