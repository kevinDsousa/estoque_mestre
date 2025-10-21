#!/bin/bash
set -euo pipefail

DOCKER_DIR="$(dirname "$0")/../docker"
NETWORK_NAME="observability"
CONTAINER_NAME="nodex-api"

read -p "Deseja iniciar o container da API? (sim/não): " iniciar_api

# Parar e remover todos os containers em execução que estão dentro da pasta docker
echo "Parando e removendo todos os containers em execução dentro da pasta docker..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" down || true

if [ "$iniciar_api" == "sim" ]; then
  # Construir o projeto antes de iniciar os containers Docker
  cd "$(dirname "$0")/.." || exit 1
  mvn clean package -DskipTests
  cd "$(dirname "$0")/docker" || exit 1
else
  cd "$DOCKER_DIR" || exit 1
fi

# (Re)criando rede nomeada para garantir existência
if ! docker network ls --format '{{.Name}}' | grep -qx "$NETWORK_NAME"; then
  echo "Criando a rede '$NETWORK_NAME'..."
  docker network create "$NETWORK_NAME"
else
  echo "Rede '$NETWORK_NAME' já existe."
fi

if [ "$iniciar_api" == "sim" ]; then
  # Verificando se o container 'nodex-api' está em execução
  if docker ps --filter "name=$CONTAINER_NAME" --filter "status=running" | grep -w "$CONTAINER_NAME" > /dev/null; then
      echo "Container '$CONTAINER_NAME' já está em execução. Parando e removendo..."
      docker compose -f "$DOCKER_DIR/docker-compose.yml" down || true
      echo "Recriando os containers..."
      docker compose -f "$DOCKER_DIR/docker-compose.yml" up --build -d
  else
      echo "Container '$CONTAINER_NAME' não está em execução. Criando e iniciando..."
      docker compose -f "$DOCKER_DIR/docker-compose.yml" up --build -d
  fi
else
  if docker ps --filter "name=$CONTAINER_NAME" --filter "status=running" | grep -w "$CONTAINER_NAME" > /dev/null; then
      echo "Container '$CONTAINER_NAME' está em execução. Parando..."
      docker stop "$CONTAINER_NAME"
      docker rm "$CONTAINER_NAME"
  fi
  echo "Iniciando os containers sem a API..."
  docker compose -f "$DOCKER_DIR/docker-compose.yml" up --build -d postgres-db redis redis-commander loki promtail prometheus grafana
fi

# Garantindo que containers principais estejam na rede 'observability'
NEEDED_CONTAINERS=(
  "$CONTAINER_NAME"
  "postgres-db"
  "redis"
  "redis-commander"
  "loki"
  "promtail"
  "prometheus"
  "grafana"
)

for container in "${NEEDED_CONTAINERS[@]}"; do
  if docker ps --format '{{.Names}}' | grep -qx "$container"; then
    if ! docker network inspect "$NETWORK_NAME" | grep -q "$container"; then
      echo "Adicionando container '$container' à rede '$NETWORK_NAME'..."
      docker network connect "$NETWORK_NAME" "$container" || true
    fi
  fi
done

# Verificando o status dos containers
echo "Containers em execução:"
docker ps

# Verificando se o container 'postgres-db' está em execução
if ! docker ps --filter "name=postgres-db" --filter "status=running" | grep -w "postgres-db" > /dev/null; then
  echo "Erro: O container 'postgres-db' não está em execução."
  exit 1
fi

# Verificando se o container 'postgres-db' está na rede 'observability'
if ! docker network inspect "$NETWORK_NAME" | grep -q "postgres-db"; then
  echo "Adicionando container 'postgres-db' à rede '$NETWORK_NAME'..."
  docker network connect "$NETWORK_NAME" "postgres-db"
fi

# Criar database e schema padrão dentro do Postgres (idempotente)
DB_NAME="${DB_NAME:-postes}"
DB_SCHEMA="${DB_SCHEMA:-telecom}"
DB_USERNAME="${DB_USERNAME:-postgres}"

echo "Garantindo database '$DB_NAME' e schema '$DB_SCHEMA'..."
# Espera o Postgres ficar pronto dentro do container
echo "Aguardando Postgres aceitar conexões..."
docker exec -i postgres-db bash -lc "until pg_isready -h 127.0.0.1 -p 5432 -U \${DB_USERNAME:-postgres} >/dev/null 2>&1; do echo '...'; sleep 2; done"

# Cria DB se não existir
if ! docker exec -i postgres-db psql -h 127.0.0.1 -p 5432 -U "$DB_USERNAME" -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  docker exec -i postgres-db psql -h 127.0.0.1 -p 5432 -U "$DB_USERNAME" -c "CREATE DATABASE \"${DB_NAME}\";"
  echo "Database '${DB_NAME}' criado."
else
  echo "Database '${DB_NAME}' já existe."
fi

# Cria schema e ajusta search_path
docker exec -i postgres-db psql -h 127.0.0.1 -p 5432 -U "$DB_USERNAME" -d "$DB_NAME" -c "CREATE SCHEMA IF NOT EXISTS \"${DB_SCHEMA}\" AUTHORIZATION ${DB_USERNAME};"
docker exec -i postgres-db psql -h 127.0.0.1 -p 5432 -U "$DB_USERNAME" -d "$DB_NAME" -c "ALTER DATABASE \"${DB_NAME}\" SET search_path TO \"${DB_SCHEMA}\", public;"
echo "Schema '${DB_SCHEMA}' garantido e search_path configurado."

# Verificando a conectividade com o banco de dados a partir do contêiner da API
if [ "$iniciar_api" == "sim" ]; then
  echo "Verificando a conectividade com o banco de dados a partir do contêiner '$CONTAINER_NAME'..."
  docker exec -it "$CONTAINER_NAME" sh -c 'apt-get update && apt-get install -y postgresql-client && pg_isready -h postgres-db -p 5432 -U postgres'
fi

# if [ "$iniciar_api" == "sim" ]; then
#   # Exibindo os logs do container da API
#   echo "Exibindo logs da API..."
#   docker logs -f nodex-api
# fi