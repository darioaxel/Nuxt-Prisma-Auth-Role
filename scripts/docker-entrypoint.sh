#!/bin/sh
set -e

echo "⏳ Esperando a que la base de datos esté disponible..."
until pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-app_user}" > /dev/null 2>&1; do
  sleep 1
done

echo "📦 Sincronizando schema de Prisma..."
npx prisma db push --accept-data-loss --schema prisma/schema

echo "🌱 Ejecutando seed..."
npx prisma db seed

echo "🚀 Iniciando aplicación..."
exec node .output/server/index.mjs
