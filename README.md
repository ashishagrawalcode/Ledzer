# Ledzer

<p align="center">
  <img src="./apps/web/public/icon-512x512.png" width="120" alt="Ledzer Logo" />
</p>

<h3 align="center">
Modern Accounting & Business Management Platform
</h3>

<p align="center">
Offline-capable PWA • Double-Entry Accounting • Inventory • Invoicing • Reporting
</p>

---

## Overview

Ledzer is a modern accounting and business management platform built for small businesses.

Unlike traditional accounting software that prioritizes accounting terminology, Ledzer focuses on a clean, modern workflow inspired by products such as Mercury, Stripe, Brex, Linear, and Resend.

The project was built as a full-stack learning project to explore:

* Next.js App Router
* TypeScript
* Prisma ORM
* PostgreSQL
* Authentication
* Progressive Web Apps (PWA)
* Offline-first architecture
* Modern SaaS UI/UX patterns
* Production deployment workflows

---

## Key Features

### Authentication

* Secure authentication using NextAuth
* Session management
* Protected dashboard routes

### Business Management

* Multi-business architecture
* Business settings management
* Fiscal year support
* Currency configuration

### Customer & Supplier Management

* Customer records
* Supplier records
* Linked accounting ledgers
* Opening balance support
* Transaction history tracking

### Accounting Engine

Ledzer uses a proper double-entry accounting architecture.

Supported voucher types:

* Sales
* Purchase
* Receipt
* Payment
* Journal
* Contra

Features:

* Automatic balance validation
* Ledger posting
* Voucher numbering
* Opening balance journals

---

### Invoicing

* Sales invoice creation
* Dynamic line items
* Tax calculation
* Invoice preview
* Printable invoice view

---

### Inventory Management

* Product catalog
* SKU support
* Stock tracking
* Reorder level support
* Purchase and sale pricing

---

### Reports

Available reports include:

* Profit & Loss Statement
* Balance Sheet
* Day Book
* Cash Flow Statement
* Party Ledger

---

### Export Functionality

Built-in export support:

* PDF generation
* Excel exports

---

### Universal Search

Global command-style search allows quick navigation across:

* Customers
* Suppliers
* Ledgers
* Transactions
* Vouchers

---

### Progressive Web App (PWA)

Ledzer can be installed directly from the browser.

Features:

* Installable on desktop and mobile
* Standalone application mode
* Service worker support
* Local caching
* Responsive design

---

### Mobile Experience

* Fully responsive interface
* Mobile navigation
* Touch-friendly forms
* Mobile-first layouts

---

## Technology Stack

### Frontend

* Next.js 14
* React 18
* TypeScript
* Tailwind CSS
* Framer Motion
* Zustand
* TanStack Query

### Backend

* Next.js Server Actions
* Prisma ORM
* PostgreSQL

### Authentication

* NextAuth v5
* Prisma Adapter

### Offline & PWA

* next-pwa
* IndexedDB
* Service Workers

### Reporting

* jsPDF
* jsPDF AutoTable

### UI Libraries

* Lucide React
* clsx
* tailwind-merge

---

## Architecture

### Frontend Layer

Responsible for:

* UI rendering
* User interaction
* Client-side state management
* Offline caching

### Server Actions Layer

Responsible for:

* Business logic
* Validation
* Database operations
* Revalidation

### Database Layer

Managed through Prisma ORM.

Core entities:

* User
* Business
* Party
* Ledger
* Voucher
* VoucherEntry
* Product

---

## Database Design

The accounting engine follows standard double-entry bookkeeping principles.

### Voucher

Represents:

* Invoice
* Payment
* Receipt
* Journal
* Contra

### Voucher Entry

Every voucher contains:

* Debit entries
* Credit entries

The system ensures:

Total Debits = Total Credits

before a transaction is committed.

---

## UI Design Principles

Ledzer follows a modern fintech-inspired design system.

### Inspiration

* Mercury
* Stripe
* Brex
* Linear
* Resend

### Design Goals

* Minimal
* Fast
* Professional
* Mobile-first
* Accessible

### Theme

Dark and Light mode support

### Typography

* Inter
* Geist
* Geist Mono

---

## Project Goals

This project was built primarily to learn and apply:

* Full-stack web development
* Modern React patterns
* Database design
* Accounting system architecture
* Progressive Web Apps
* Production deployment workflows

---

## Current Status

### Implemented

* Authentication
* Dashboard
* Customers
* Suppliers
* Ledgers
* Inventory
* Invoices
* Reports
* Exports
* Universal Search
* PWA Installation
* Responsive Design

### Experimental / In Progress

* Offline synchronization improvements
* Advanced analytics
* Additional automation workflows

---

## Development

Install dependencies

```bash
pnpm install
```

Run development environment

```bash
pnpm dev
```

Build entire monorepo

```bash
pnpm build
```

Lint workspace

```bash
pnpm lint
```

---

### Running Individual Packages

Web App

```bash
pnpm --filter web dev
```

Production Preview

```bash
pnpm --filter web start
```

Database Package

```bash
pnpm --filter @ledzer/database generate
```

---

## Project Structure

Detailed project structure is documented in:

```text
docs/PROJECT_STRUCTURE.md
```

Generate updated structure:

```powershell
& "C:\Program Files (x86)\GnuWin32\bin\tree.exe" -I "node_modules|.next|.turbo|dist" > docs/tree.txt
```

---

## Author

Ashish Agrawal

B.Tech Computer Science Engineering
BML Munjal University

---

## License

This project is currently maintained as a personal learning and portfolio project.
