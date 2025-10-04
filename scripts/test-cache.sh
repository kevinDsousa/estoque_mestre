#!/bin/bash

# Script para testar o cache do Turbo localmente

echo "🚀 Testando cache do Turbo..."

# Limpar cache anterior
echo "🧹 Limpando cache anterior..."
pnpm turbo clean

# Primeiro build (sem cache)
echo "📦 Primeiro build (sem cache)..."
time pnpm turbo build

# Segundo build (com cache)
echo "⚡ Segundo build (com cache)..."
time pnpm turbo build

# Mostrar estatísticas do cache
echo "📊 Estatísticas do cache:"
pnpm turbo build --dry-run

echo "✅ Teste de cache concluído!"
