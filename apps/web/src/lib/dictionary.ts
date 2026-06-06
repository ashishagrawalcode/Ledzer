export type TerminologyMode = 'standard' | 'simple'

export interface TermDictionary {
  // --- Navigation & Dashboard ---
  dashboard: string
  transactions: string
  invoices: string
  salesInvoices: string
  purchaseBills: string
  receipts: string
  payments: string
  journals: string
  contra: string
  masters: string
  ledgers: string
  groups: string
  voucherTypes: string
  parties: string
  customers: string
  suppliers: string
  inventory: string
  reports: string
  settings: string
  more: string

  // --- Old Keys (Required for existing pages) ---
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
  customer: string
  supplier: string
  salesVoucher: string
  purchaseVoucher: string
  receiptVoucher: string
  paymentVoucher: string
  journalVoucher: string
  contraVoucher: string
  cashAvailable: string
  pendingPayments: string
  overdueInvoices: string
  recentActivity: string
  
  // --- Actions ---
  createVoucher: string
  createLedger: string
  viewLedger: string
  newInvoice: string
  newPurchase: string
  newReceipt: string
  newPayment: string
  newJournal: string
  newContra: string
  newLedger: string
  newCustomer: string
  newSupplier: string

  // --- Descriptions & Reports ---
  dayBook: string
  partyLedger: string
  descSales: string
  descPurchase: string
  descReceipts: string
  descPayments: string
  descJournals: string
  descContra: string
  descLedgers: string
  descGroups: string
  descVoucherTypes: string
  descCustomers: string
  descSuppliers: string
  descPnL: string
  descBalanceSheet: string
  descDayBook: string
  descCashFlow: string
  descPartyLedger: string
}

export const STANDARD_TERMS: TermDictionary = {
  // Navigation
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  invoices: 'Invoices',
  salesInvoices: 'Sales Invoices',
  purchaseBills: 'Purchase Bills',
  receipts: 'Receipts',
  payments: 'Payments',
  journals: 'Journals',
  contra: 'Contra',
  masters: 'Masters',
  ledgers: 'Ledgers',
  groups: 'Groups',
  voucherTypes: 'Voucher Types',
  parties: 'Parties',
  customers: 'Customers',
  suppliers: 'Suppliers',
  inventory: 'Inventory',
  reports: 'Reports',
  settings: 'Settings',
  more: 'More',

  // Old compatibility keys
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
  dayBook: 'Day Book',
  partyLedger: 'Party Ledger',
  createVoucher: 'Create Voucher',
  createLedger: 'Create Ledger',
  viewLedger: 'View Ledger',

  // Actions/Descs
  newInvoice: 'New Invoice',
  newPurchase: 'New Purchase',
  newReceipt: 'New Receipt',
  newPayment: 'New Payment',
  newJournal: 'New Journal',
  newContra: 'New Contra',
  newLedger: 'New Ledger',
  newCustomer: 'New Customer',
  newSupplier: 'New Supplier',
  descSales: 'Create & manage sales vouchers',
  descPurchase: 'Record purchase vouchers',
  descReceipts: 'Payments received from customers',
  descPayments: 'Payments made to suppliers',
  descJournals: 'Manual adjustment entries',
  descContra: 'Cash & bank transfers',
  descLedgers: 'Chart of accounts',
  descGroups: 'Account group management',
  descVoucherTypes: 'Custom voucher configuration',
  descCustomers: 'People who owe you money',
  descSuppliers: 'People you owe money to',
  descPnL: 'Income and expense summary',
  descBalanceSheet: 'Assets and liabilities',
  descDayBook: 'All transactions for a day',
  descCashFlow: 'Money movement overview',
  descPartyLedger: 'Individual party statements',
}

export const SIMPLE_TERMS: TermDictionary = {
  // Navigation
  dashboard: 'Home',
  transactions: 'Activity',
  invoices: 'Bills',
  salesInvoices: 'Sales Bills',
  purchaseBills: 'Purchase Bills',
  receipts: 'Money In',
  payments: 'Money Out',
  journals: 'Adjustments',
  contra: 'Bank Transfer',
  masters: 'Settings',
  ledgers: 'Accounts',
  groups: 'Categories',
  voucherTypes: 'Config',
  parties: 'Contacts',
  customers: 'Customers',
  suppliers: 'Vendors',
  inventory: 'Products',
  reports: 'Analytics',
  settings: 'Settings',
  more: 'More',

  // Old compatibility keys (Simplified)
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
  dayBook: 'Daily Log',
  partyLedger: 'History by person',
  createVoucher: 'New Transaction',
  createLedger: 'Add Account',
  viewLedger: 'View History',

  // Actions/Descs
  newInvoice: 'New Bill',
  newPurchase: 'New Purchase',
  newReceipt: 'New Receipt',
  newPayment: 'New Payment',
  newJournal: 'New Entry',
  newContra: 'New Transfer',
  newLedger: 'Add Account',
  newCustomer: 'Add Customer',
  newSupplier: 'Add Vendor',
  descSales: 'Manage your sales',
  descPurchase: 'Track purchases',
  descReceipts: 'Track money received',
  descPayments: 'Track money spent',
  descJournals: 'Make adjustments',
  descContra: 'Transfer between accounts',
  descLedgers: 'List of accounts',
  descGroups: 'Manage categories',
  descVoucherTypes: 'Transaction settings',
  descCustomers: 'Your clients',
  descSuppliers: 'Your vendors',
  descPnL: 'Total Profit',
  descBalanceSheet: 'Business Health',
  descDayBook: 'Daily log',
  descCashFlow: 'Cash status',
  descPartyLedger: 'History by person',
}

export function getDictionary(mode: TerminologyMode): TermDictionary {
  return mode === 'simple' ? SIMPLE_TERMS : STANDARD_TERMS
}

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