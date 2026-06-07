# Development Guide

## Monorepo Architecture

Ledzer is built as a Turborepo monorepo.

Structure:

```text
apps/
packages/
```

---

## Packages

### web

Main Next.js application.

Contains:

- UI
- Server Actions
- Pages
- API Routes
- PWA Logic

Location:

```text
apps/web
```

---

### @ledzer/database

Prisma schema and database client.

Location:

```text
packages/database
```

Responsibilities:

- Prisma Schema
- Database Models
- Prisma Client Generation

---

### @ledzer/ui

Shared UI components.

Location:

```text
packages/ui
```

Responsibilities:

- Reusable Buttons
- Shared UI Utilities
- Shared Design System

---

## Workspace Commands

Install dependencies

```bash
pnpm install
```

Run development

```bash
pnpm dev
```

Build all packages

```bash
pnpm build
```

Lint all packages

```bash
pnpm lint
```

---

# Prisma Commands

Generate Prisma Client

```bash
pnpm --filter @ledzer/database generate
```

or

```bash
pnpm --filter @ledzer/database db:generate
```

Push schema changes

```bash
pnpm --filter @ledzer/database push
```

or

```bash
pnpm --filter @ledzer/database db:push
```

Open Prisma Studio

```bash
pnpm --filter @ledzer/database db:studio
```

---

# Web Commands

Run development server

```bash
pnpm --filter web dev
```

Build production version

```bash
pnpm --filter web build
```

Run production build

```bash
pnpm --filter web start
```

Lint application

```bash
pnpm --filter web lint
```

---

# Build Process

Production build flow:

1. Prisma Client Generation
2. Type Checking
3. Next.js Build
4. Static Optimization
5. PWA Asset Generation

Command:

```bash
pnpm build
```

---

# Deployment

Current deployment target:

- Vercel

Build command:

```bash
pnpm build
```

Output:

```text
Next.js Application
```

---

# Project Tree Generation

Generate latest project structure:

```powershell
& "C:\Program Files (x86)\GnuWin32\bin\tree.exe" -I "node_modules|.next|.turbo|dist" > docs/tree.txt
```

Useful before updating documentation.