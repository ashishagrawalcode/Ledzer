# TREE.md

## Repository Structure

```text
ledzer/
│
├── apps/
│   └── web/
│       │
│       ├── public/
│       │   ├── manifest.json
│       │   ├── sw.js
│       │   └── PWA assets
│       │
│       ├── src/
│       │
│       ├── actions/                     # Server Actions
│       │   ├── business.ts
│       │   ├── globalSearch.ts
│       │   ├── inventory.ts
│       │   ├── invoice.ts
│       │   ├── ledgers.ts
│       │   ├── parties.ts
│       │   ├── receiptPayment.ts
│       │   ├── settings.ts
│       │   ├── setup.ts
│       │   └── vouchers.ts
│       │
│       ├── app/
│       │   │
│       │   ├── (auth)/
│       │   │   └── login/
│       │   │
│       │   ├── (dashboard)/
│       │   │   │
│       │   │   ├── dashboard/
│       │   │   ├── inventory/
│       │   │   ├── invoices/
│       │   │   │
│       │   │   ├── masters/
│       │   │   │   ├── groups/
│       │   │   │   ├── ledgers/
│       │   │   │   └── voucher-types/
│       │   │   │
│       │   │   ├── parties/
│       │   │   │   ├── customers/
│       │   │   │   ├── suppliers/
│       │   │   │   └── [id]/
│       │   │   │
│       │   │   ├── reports/
│       │   │   │   ├── balance-sheet/
│       │   │   │   ├── cashflow/
│       │   │   │   ├── daybook/
│       │   │   │   ├── party-ledger/
│       │   │   │   └── pnl/
│       │   │   │
│       │   │   ├── settings/
│       │   │   │
│       │   │   └── transactions/
│       │   │       ├── sales/
│       │   │       ├── purchases/
│       │   │       ├── receipts/
│       │   │       ├── payments/
│       │   │       ├── journals/
│       │   │       └── contra/
│       │   │
│       │   └── api/
│       │       └── auth/
│       │
│       ├── components/
│       │   ├── dashboard/
│       │   ├── inventory/
│       │   ├── invoices/
│       │   ├── parties/
│       │   ├── reports/
│       │   ├── transactions/
│       │   ├── masters/
│       │   ├── settings/
│       │   ├── landing/
│       │   └── shared/
│       │
│       ├── hooks/
│       │   ├── useOfflineAction.ts
│       │   ├── usePendingItems.ts
│       │   └── useTerms.ts
│       │
│       ├── lib/
│       │   ├── auth.ts
│       │   ├── dictionary.ts
│       │   ├── offlineDb.ts
│       │   ├── syncManager.ts
│       │   ├── taxEngine.ts
│       │   ├── transactions.ts
│       │   └── validations.ts
│       │
│       ├── services/
│       │   ├── pdfGenerator.ts
│       │   └── excelGenerator.ts
│       │
│       └── store/
│           └── usePreferencesStore.ts
│
├── packages/
│   │
│   ├── database/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │
│   ├── ui/
│   │   ├── components/
│   │   └── lib/
│   │
│   └── tsconfig/
│
├── docs/
│   ├── PROJECT_STRUCTURE.md
│   └── TREE.md
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

### Statistics

* 74 Directories
* 138 Files
* Next.js App Router
* Turborepo Monorepo
* Prisma + PostgreSQL
* NextAuth Authentication
* Progressive Web App (PWA)
* Offline Infrastructure (Work In Progress)
* Shared UI Package
* Shared Database Package

```
```
