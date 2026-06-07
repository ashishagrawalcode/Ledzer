# Project Structure

This document explains the architecture and folder organization of Ledzer.

For the latest raw filesystem snapshot, see:

```text
docs/tree.txt
```

---

# Monorepo Overview

Ledzer is organized as a Turborepo monorepo.

```text
root
├── apps/
├── packages/
├── docs/
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

The repository is divided into three major areas:

| Directory | Purpose               |
| --------- | --------------------- |
| apps      | Applications          |
| packages  | Shared libraries      |
| docs      | Project documentation |

---

# Root Configuration

## package.json

Workspace-level scripts.

Responsibilities:

* Run development environment
* Build all packages
* Lint all packages

---

## turbo.json

Turbo configuration.

Used for:

* Task orchestration
* Build pipelines
* Caching

---

## pnpm-workspace.yaml

Defines workspace packages.

Allows:

* Shared dependencies
* Internal package linking
* Monorepo package resolution

---

# Applications

## apps/web

Main Next.js application.

Contains:

* Frontend UI
* Dashboard
* Server Actions
* Authentication
* Reports
* Inventory
* Accounting Engine
* PWA Functionality

---

# Public Assets

Location:

```text
apps/web/public
```

Contains:

| File             | Purpose              |
| ---------------- | -------------------- |
| favicon.ico      | Browser favicon      |
| icon-192x192.png | PWA icon             |
| icon-512x512.png | PWA icon             |
| manifest.json    | PWA manifest         |
| sw.js            | Service worker       |
| workbox-*        | Generated PWA assets |

---

# Source Code

Location:

```text
apps/web/src
```

Main application source code.

---

# Server Actions

Location:

```text
src/actions
```

Server-side business logic.

## business.ts

Business creation and management.

## globalSearch.ts

Universal search system.

Searches:

* Customers
* Suppliers
* Ledgers
* Vouchers
* Transactions

---

## inventory.ts

Inventory management operations.

---

## invoice.ts

Invoice creation and processing.

---

## ledgers.ts

Ledger management logic.

---

## parties.ts

Customer and supplier operations.

---

## receiptPayment.ts

Receipt and payment voucher handling.

---

## settings.ts

Application settings operations.

---

## setup.ts

Business onboarding setup.

---

## vouchers.ts

Generic accounting voucher creation.

Handles:

* Sales
* Purchases
* Journals
* Contra
* Receipts
* Payments

---

# App Router

Location:

```text
src/app
```

Uses Next.js App Router architecture.

---

# Authentication Routes

```text
(auth)
```

Contains:

```text
login/
```

Handles user authentication flow.

---

# Dashboard Routes

```text
(dashboard)
```

Protected application area.

---

## Dashboard

```text
dashboard/
```

Business overview and analytics.

---

## Inventory

```text
inventory/
```

Product and stock management.

---

## Invoices

```text
invoices/
```

Invoice workflows.

---

## Masters

Administrative configuration pages.

Contains:

* Ledger management
* Account groups
* Voucher types

---

## Parties

Customer and supplier management.

Contains:

```text
customers/
suppliers/
[id]/
```

Supports:

* Listing
* Creation
* Detail pages
* Ledger views

---

## Transactions

Core accounting operations.

Supported transaction types:

* Sales
* Purchases
* Receipts
* Payments
* Journals
* Contra

Each module contains:

```text
list page
new transaction page
details page (where applicable)
```

---

## Reports

Contains:

* Profit & Loss
* Balance Sheet
* Cash Flow
* Day Book
* Party Ledger

---

## Settings

Application preferences and configuration.

---

# API Layer

Location:

```text
src/app/api
```

Contains:

```text
auth/
```

NextAuth route handlers.

---

# Components

Location:

```text
src/components
```

Reusable UI components grouped by feature.

---

## dashboard

Dashboard widgets and charts.

---

## inventory

Inventory-specific UI.

---

## invoices

Invoice builder and printable invoice views.

---

## landing

Marketing website components.

Includes:

* Hero Section
* Features Section
* Metrics
* Demo Components
* Footer
* Landing Navigation

---

## layout

Application layout components.

Contains:

* AppNavbar
* MobileBottomNav

---

## masters

Master data management UI.

---

## parties

Customer and supplier UI.

---

## reports

Reporting visualizations.

---

## settings

Settings UI.

---

## shared

Reusable application components.

Includes:

* Tables
* Export controls
* Headers
* Status badges
* Onboarding flows

---

## transactions

Voucher and transaction forms.

---

# Hooks

Location:

```text
src/hooks
```

Custom React hooks.

## useOfflineAction

Offline-first action handling.

## usePendingItems

Pending sync tracking.

## useTerms

Terminology switching system.

Used for:

* Standard Accounting Mode
* Simplified Business Mode

---

# Core Libraries

Location:

```text
src/lib
```

Application utilities and core services.

---

## auth.ts

Authentication configuration.

---

## dictionary.ts

Terminology engine.

Maps accounting terms to simplified business language.

---

## offlineDb.ts

IndexedDB integration.

---

## syncManager.ts

Offline synchronization management.

---

## taxEngine.ts

Tax calculation utilities.

---

## transactions.ts

Transaction helper functions.

---

## validations.ts

Validation schemas and helpers.

---

## utils.ts

Shared utility functions.

---

# Services

Location:

```text
src/services
```

Document generation services.

## pdfGenerator.ts

PDF export generation.

## excelGenerator.ts

Excel export generation.

---

# State Management

Location:

```text
src/store
```

## usePreferencesStore.ts

User preferences storage.

Handles:

* Theme
* Terminology preferences
* Local settings

---

# Shared Packages

## packages/database

Database layer.

Contains:

```text
Prisma Schema
Prisma Client
Database Utilities
```

Key file:

```text
packages/database/prisma/schema.prisma
```

Defines:

* Users
* Businesses
* Parties
* Ledgers
* Vouchers
* Voucher Entries
* Products

---

## packages/ui

Shared design system.

Contains reusable UI components and utilities.

Currently includes:

* Buttons
* Utility functions

Designed for future expansion into a larger component library.

---

## packages/tsconfig

Shared TypeScript configurations.

Provides:

* Base configuration
* Next.js configuration
* React library configuration

Used across the monorepo.

---

# Architectural Flow

```text
User Interface
        ↓
React Components
        ↓
Server Actions
        ↓
Prisma ORM
        ↓
PostgreSQL Database
```

Offline-capable flow:

```text
User Action
      ↓
IndexedDB Cache
      ↓
Sync Manager
      ↓
Server Actions
      ↓
Database
```

---

# Current Repository Statistics

Generated from tree snapshot:

```text
74 Directories
138 Files
```

Architecture Style:

```text
Monorepo
Feature-Oriented
Next.js App Router
Prisma ORM
PostgreSQL
PWA-Ready
Offline-Capable
```
