#!/bin/sh
set -e

echo "⏳ Waiting for Postgres at ${DATABASE_HOST:-postgres}:${DATABASE_PORT:-5432}..."
until nc -z "${DATABASE_HOST:-postgres}" "${DATABASE_PORT:-5432}"; do
  sleep 1
done
echo "✓ Postgres is up."

echo "📦 Syncing database schema (prisma db push)..."
npx prisma db push --skip-generate --accept-data-loss

echo "🌱 Seeding database..."
npx tsx prisma/seed.ts || echo "⚠️  Seed skipped or already applied."

echo "🚀 Starting Novelo on port ${PORT:-3000}..."
exec npm run start
