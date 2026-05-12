#!/bin/sh
set -e

echo "==> Generating Prisma client..."
npx prisma generate

echo "==> Syncing database schema..."
# In development, db push applies the schema directly without migration files.
# Before production, run: npx prisma migrate dev --name init  (locally or in CI)
# then switch this to: npx prisma migrate deploy
if [ "$NODE_ENV" = "production" ]; then
  npx prisma migrate deploy
else
  npx prisma db push --skip-generate
fi

echo "==> Starting Next.js dev server..."
npm run dev &

echo "==> Starting BullMQ worker..."
npx tsx watch worker/index.ts &

wait
