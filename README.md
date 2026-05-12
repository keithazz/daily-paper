# Daily Paper

## Running the stack

```bash
docker compose up --build
```

Starts Postgres, Redis, the Next.js dev server, and the BullMQ worker in a single container. Source is mounted as a volume — Next.js and the worker both hot-reload on file changes. App is at `http://localhost:3000`.

## Running tests

Unit tests (Jest):
```bash
npm test
```

E2E tests (Playwright) — requires the stack to be running:
```bash
npm run test:e2e
```

## Database changes

1. Edit `prisma/schema.prisma`.
2. Create a migration:
   ```bash
   npx prisma migrate dev --name <describe-the-change>
   ```
   This updates your local database and writes a migration file to `prisma/migrations/`.
3. The next `docker compose up` picks up the new migration automatically via `prisma db push` (dev) or `prisma migrate deploy` (production).

> The Prisma client is regenerated on each container start, so no manual `prisma generate` is needed after schema changes.
