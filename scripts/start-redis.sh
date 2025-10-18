#!/bin/bash

# Script para iniciar Redis para o projeto Estoque Mestre

echo "🚀 Iniciando Redis para Estoque Mestre..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se o arquivo docker-compose.redis.yml existe
if [ ! -f "docker-compose.redis.yml" ]; then
    echo "❌ Arquivo docker-compose.redis.yml não encontrado."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers Redis existentes..."
docker-compose -f docker-compose.redis.yml down

# Iniciar Redis
echo "🔄 Iniciando Redis..."
docker-compose -f docker-compose.redis.yml up -d

# Aguardar Redis estar pronto
echo "⏳ Aguardando Redis estar pronto..."
sleep 5

# Verificar se Redis está rodando
if docker-compose -f docker-compose.redis.yml ps | grep -q "Up"; then
    echo "✅ Redis iniciado com sucesso!"
    echo ""
    echo "📊 Informações do Redis:"
    echo "   - Host: localhost"
    echo "   - Porta: 6379"
    echo "   - Redis Commander: http://localhost:8081"
    echo ""
    echo "🔧 Para parar o Redis:"
    echo "   docker-compose -f docker-compose.redis.yml down"
    echo ""
    echo "📝 Para ver logs:"
    echo "   docker-compose -f docker-compose.redis.yml logs -f"
else
    echo "❌ Falha ao iniciar Redis. Verifique os logs:"
    docker-compose -f docker-compose.redis.yml logs
    exit 1
fi
