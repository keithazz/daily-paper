# ADR-002: Adopt Next.js / Postgres / Redis / BullMQ / Docker as the application stack

> **Status**: accepted
> **Date**: 2026-05-12
> **Deciders**: keith
> **Related**: ADR-001 (adopt planning workflow)

## Context

The project is a web application — a "daily paper" reader — that requires a full-stack web framework, persistent relational storage, background job processing for fetching and digesting content, and a portable deployment story.

The team is a single engineer working in TypeScript. The stack needed to be cohesive (one language end-to-end), productive at small scale, and capable of the async work-queue model that paper ingestion demands. Operational simplicity was a hard constraint — no managed cloud services, no separate orchestration platform.

## Decision

We will use Next.js 15 (App Router, React Server Components) as the full-stack web layer, Prisma 6 as the database access layer over Postgres, Redis as the in-process broker and cache, BullMQ 5 as the job queue library, and Docker Compose for both local development and production deployment.

All application code is TypeScript. The worker process runs alongside Next.js as a separate long-lived process, sharing the Prisma client and Redis connection.

## Alternatives Considered

### Alternative A: Remix + Express worker

Remix is a compelling Next.js alternative with a simpler data model, but at the time of decision Next.js 15 RSC support was further along and the ecosystem (shadcn, Auth.js adapter) targeted Next.js first. Rejected in favour of ecosystem fit.

### Alternative B: pg-boss instead of Redis + BullMQ

pg-boss runs jobs directly in Postgres, eliminating Redis as a dependency. Rejected because BullMQ's throughput, retry semantics, and delayed-job support are significantly richer, and Redis is already justified as a session/cache store — the second use is free.

### Alternative C: Inngest or a managed queue

Managed queues (Inngest, AWS SQS) avoid operational overhead but introduce cost, vendor lock-in, and egress of job payloads to a third party. Rejected to keep the stack self-hosted and free of external runtime dependencies.

### Alternative D: Kubernetes instead of Docker Compose

Kubernetes is appropriate for multi-node, multi-team deployments. For a single-engineer project targeting one server, Compose provides sufficient orchestration with far less ceremony. Can be revisited if the deployment scale changes.

## Consequences

**Positive:**
- TypeScript end-to-end eliminates context-switching between languages.
- RSC reduces client bundle size for a content-heavy reading interface.
- Prisma provides a type-safe, schema-first database layer with migrations.
- BullMQ handles retries, backpressure, and delayed jobs without custom infrastructure.
- Docker Compose gives production–dev parity with a single `docker compose up`.

**Negative / accepted trade-offs:**
- Redis is a second stateful service that must be backed up, monitored, and sized alongside Postgres.
- Next.js App Router is evolving rapidly; minor-version upgrades may require adaptation.
- The worker and web server share the same Docker network and deployment unit — horizontal scaling of the worker independently requires splitting the Compose service, which adds complexity later.

**Follow-ups:**
- Configure BullMQ worker concurrency and retry policy per queue (tracked in feature planning).
- Decide on Postgres backup strategy before going to production.
