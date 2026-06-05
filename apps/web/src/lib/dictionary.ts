/**
 * Ledzer Jargon-Free Translation Engine
 * Standard accounting terms <-> Simplified business terms
 * NEVER stored in DB — always mapped at render time
 */

export type TerminologyMode = 'standard' | 'simple'

export interface TermDictionary {
  // Core accounting terms
  accountsReceivable: string
  accountsPayable: string
  profitAndLoss: string
  balanceSheet: string
  ledger: string
  journal: string
  voucher: string
  debit: string
  credit: string
  trialBalance: string
  generalLedger: string
  sundryDebtors: string
  sundryCreditors: string
  cashFlow: string
  openingBalance: string
  closingBalance: string
  grossProfit: string
  netProfit: string
  // Navigation
  masters: string
  transactions: string
  parties: string
  inventory: string
  reports: string
  // Party types
  customer: string
  supplier: string
  // Voucher types
  salesVoucher: string
  purchaseVoucher: string
  receiptVoucher: string
  paymentVoucher: string
  journalVoucher: string
  contraVoucher: string
  // Dashboard
  cashAvailable: string
  pendingPayments: string
  overdueInvoices: string
  recentActivity: string
  // Actions
  createVoucher: string
  createLedger: string
  viewLedger: string
}

export const STANDARD_TERMS: TermDictionary = {
  accountsReceivable: 'Accounts Receivable',
  accountsPayable: 'Accounts Payable',
  profitAndLoss: 'Profit & Loss',
  balanceSheet: 'Balance Sheet',
  ledger: 'Ledger',
  journal: 'Journal',
  voucher: 'Voucher',
  debit: 'Debit',
  credit: 'Credit',
  trialBalance: 'Trial Balance',
  generalLedger: 'General Ledger',
  sundryDebtors: 'Sundry Debtors',
  sundryCreditors: 'Sundry Creditors',
  cashFlow: 'Cash Flow',
  openingBalance: 'Opening Balance',
  closingBalance: 'Closing Balance',
  grossProfit: 'Gross Profit',
  netProfit: 'Net Profit',
  masters: 'Masters',
  transactions: 'Transactions',
  parties: 'Parties',
  inventory: 'Inventory',
  reports: 'Reports',
  customer: 'Customer',
  supplier: 'Supplier',
  salesVoucher: 'Sales Voucher',
  purchaseVoucher: 'Purchase Voucher',
  receiptVoucher: 'Receipt Voucher',
  paymentVoucher: 'Payment Voucher',
  journalVoucher: 'Journal Voucher',
  contraVoucher: 'Contra Voucher',
  cashAvailable: 'Cash Available',
  pendingPayments: 'Pending Payments',
  overdueInvoices: 'Overdue Invoices',
  recentActivity: 'Recent Activity',
  createVoucher: 'Create Voucher',
  createLedger: 'Create Ledger',
  viewLedger: 'View Ledger',
}

export const SIMPLE_TERMS: TermDictionary = {
  accountsReceivable: 'Who Owes Me',
  accountsPayable: 'Who I Owe',
  profitAndLoss: 'Business Profit',
  balanceSheet: 'Business Summary',
  ledger: 'Account History',
  journal: 'Transaction Log',
  voucher: 'Transaction',
  debit: 'Money In',
  credit: 'Money Out',
  trialBalance: 'Account Check',
  generalLedger: 'All Accounts',
  sundryDebtors: 'Customers (Pending)',
  sundryCreditors: 'Suppliers (Pending)',
  cashFlow: 'Money Movement',
  openingBalance: 'Starting Amount',
  closingBalance: 'Ending Amount',
  grossProfit: 'Total Earnings',
  netProfit: 'Final Profit',
  masters: 'My Business Data',
  transactions: 'Transactions',
  parties: 'People & Businesses',
  inventory: 'My Products',
  reports: 'Business Reports',
  customer: 'Customer',
  supplier: 'Supplier',
  salesVoucher: 'Invoice / Bill',
  purchaseVoucher: 'Purchase Bill',
  receiptVoucher: 'Payment Received',
  paymentVoucher: 'Payment Made',
  journalVoucher: 'Adjustment Entry',
  contraVoucher: 'Cash Transfer',
  cashAvailable: 'Cash in Hand',
  pendingPayments: 'Pending Collections',
  overdueInvoices: 'Overdue Bills',
  recentActivity: 'Recent Activity',
  createVoucher: 'New Transaction',
  createLedger: 'Add Account',
  viewLedger: 'View History',
}

export function getTerm(key: keyof TermDictionary, mode: TerminologyMode): string {
  return mode === 'simple' ? SIMPLE_TERMS[key] : STANDARD_TERMS[key]
}

export function getDictionary(mode: TerminologyMode): TermDictionary {
  return mode === 'simple' ? SIMPLE_TERMS : STANDARD_TERMS
}

/**
 * Account group labels
 */
export const ACCOUNT_GROUP_LABELS: Record<string, { standard: string; simple: string }> = {
  ASSET: { standard: 'Asset', simple: 'What I Own' },
  LIABILITY: { standard: 'Liability', simple: 'What I Owe' },
  INCOME: { standard: 'Income', simple: 'Money I Earn' },
  EXPENSE: { standard: 'Expense', simple: 'Money I Spend' },
  EQUITY: { standard: 'Equity', simple: 'My Investment' },
}

export function getGroupLabel(group: string, mode: TerminologyMode): string {
  return ACCOUNT_GROUP_LABELS[group]?.[mode] ?? group
}