#!/bin/bash

# Script para desenvolvimento que monitora e copia o main.js

# Função para copiar o arquivo main.js
copy_main() {
    if [ -f "dist/apps/api/src/main.js" ]; then
        cp dist/apps/api/src/main.js dist/main.js
        echo "✅ Arquivo main.js copiado para dist/main.js"
        return 0
    else
        echo "❌ Arquivo dist/apps/api/src/main.js não encontrado"
        return 1
    fi
}

# Aguarda a compilação inicial
echo "🔄 Aguardando compilação inicial..."
while [ ! -f "dist/apps/api/src/main.js" ]; do
    sleep 1
done

# Copia o arquivo inicial
copy_main

# Inicia o nest em watch mode em background
echo "🚀 Iniciando NestJS em modo watch..."
npx nest start --watch &
NEST_PID=$!

# Monitora mudanças no arquivo main.js compilado
while kill -0 $NEST_PID 2>/dev/null; do
    if [ -f "dist/apps/api/src/main.js" ]; then
        # Verifica se o arquivo foi modificado
        if [ ! -f "dist/main.js" ] || [ "dist/apps/api/src/main.js" -nt "dist/main.js" ]; then
            copy_main
        fi
    fi
    sleep 1
done

wait $NEST_PID
