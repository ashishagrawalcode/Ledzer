'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@ledzer/database'
import { revalidatePath } from 'next/cache'

interface ReceiptPaymentInput {
  type: 'RECEIPT' | 'PAYMENT'
  number: string
  date: string
  partyLedgerId: string | null      // customer ledger (receipt) or supplier ledger (payment to party)
  expenseLedgerId: string | null     // expense ledger (payment to expense directly)
  bankCashLedgerId: string           // cash or bank account ledger
  amount: number
  notes: string | null
  paymentMode: 'CASH' | 'BANK' | 'UPI' | 'CHEQUE'
}

export async function createReceiptPayment(data: ReceiptPaymentInput) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized.' }

  const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) return { success: false, error: 'Business not found.' }

  if (!data.number?.trim()) return { success: false, error: 'Voucher number is required.' }
  if (!data.bankCashLedgerId) return { success: false, error: 'Cash/Bank account is required.' }
  if (!data.amount || data.amount <= 0) return { success: false, error: 'Amount must be greater than zero.' }

  const counterpartLedgerId = data.partyLedgerId ?? data.expenseLedgerId
  if (!counterpartLedgerId) return { success: false, error: 'Payee / payer is required.' }

  // Verify all ledgers belong to this business
  const ledgerIds = [data.bankCashLedgerId, counterpartLedgerId]
  const ledgers = await prisma.ledger.findMany({
    where: { id: { in: ledgerIds }, businessId: business.id },
    select: { id: true },
  })
  if (ledgers.length !== 2) return { success: false, error: 'Invalid ledger selection.' }

  // Check duplicate voucher number
  const existing = await prisma.voucher.findFirst({
    where: { businessId: business.id, type: data.type, number: data.number.trim() },
  })
  if (existing) return { success: false, error: `Voucher number "${data.number}" already exists.` }

  try {
    /*
     * RECEIPT:
     *   Dr: Bank/Cash (money comes in)
     *   Cr: Customer ledger (clears receivable)
     *
     * PAYMENT:
     *   Dr: Supplier / Expense (the obligation or cost)
     *   Cr: Bank/Cash (money goes out)
     */
    const isReceipt = data.type === 'RECEIPT'

    await prisma.voucher.create({
      data: {
        businessId: business.id,
        type: data.type,
        number: data.number.trim(),
        date: new Date(data.date),
        notes: data.notes
          ? `[${data.paymentMode}] ${data.notes}`
          : `[${data.paymentMode}]`,
        entries: {
          create: [
            {
              // Debit entry
              ledgerId: isReceipt ? data.bankCashLedgerId : counterpartLedgerId,
              type: 'DEBIT',
              amount: data.amount,
            },
            {
              // Credit entry
              ledgerId: isReceipt ? counterpartLedgerId : data.bankCashLedgerId,
              type: 'CREDIT',
              amount: data.amount,
            },
          ],
        },
      },
    })

    revalidatePath('/transactions/receipts')
    revalidatePath('/transactions/payments')
    revalidatePath('/dashboard')
    revalidatePath('/reports/cashflow')
    return { success: true }
  } catch (e) {
    console.error('Receipt/Payment creation error:', e)
    return { success: false, error: 'Failed to save voucher.' }
  }
}