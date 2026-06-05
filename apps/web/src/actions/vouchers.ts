'use server'

import { prisma as db } from '@ledzer/database'
import { revalidatePath } from 'next/cache'

interface VoucherEntryInput {
  ledgerId: string
  type: 'DEBIT' | 'CREDIT'
  amount: number
}

interface CreateVoucherInput {
  businessId: string
  type: string
  date: Date
  notes?: string
  entries: VoucherEntryInput[]
}

export async function createVoucher(input: CreateVoucherInput) {
  try {
    // Validate double-entry balance
    const debits = input.entries.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0)
    const credits = input.entries.filter((e) => e.type === 'CREDIT').reduce((s, e) => s + e.amount, 0)

    if (Math.abs(debits - credits) > 0.01) {
      return { error: 'Voucher is not balanced. Debits must equal Credits.' }
    }

    if (input.entries.some((e) => e.amount <= 0)) {
      return { error: 'All amounts must be greater than zero.' }
    }

    if (input.entries.some((e) => !e.ledgerId)) {
      return { error: 'All entries must have a ledger selected.' }
    }

    // Generate voucher number
    const prefix = getPrefix(input.type)
    const count = await db.voucher.count({
      where: { businessId: input.businessId, type: input.type as never },
    })
    const number = `${prefix}-${String(count + 1).padStart(4, '0')}`

    await db.voucher.create({
      data: {
        businessId: input.businessId,
        type: input.type as never,
        number,
        date: input.date,
        notes: input.notes ?? null,
        entries: {
          create: input.entries.map((e) => ({
            ledgerId: e.ledgerId,
            type: e.type,
            amount: e.amount,
          })),
        },
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/transactions/sales')
    revalidatePath('/transactions/purchases')
    revalidatePath('/transactions/receipts')
    revalidatePath('/transactions/payments')
    revalidatePath('/transactions/journals')
    revalidatePath('/transactions/contra')

    return { success: true }
  } catch (error) {
    console.error('Create voucher error:', error)
    return { error: 'Failed to save voucher. Please try again.' }
  }
}

function getPrefix(type: string): string {
  const map: Record<string, string> = {
    SALES: 'INV',
    PURCHASE: 'BILL',
    RECEIPT: 'REC',
    PAYMENT: 'PAY',
    JOURNAL: 'JV',
    CONTRA: 'CTR',
  }
  return map[type] ?? 'VCH'
}

export async function deleteVoucher(id: string, businessId: string) {
  try {
    const voucher = await db.voucher.findFirst({ where: { id, businessId } })
    if (!voucher) return { error: 'Voucher not found' }

    await db.voucher.delete({ where: { id } })
    revalidatePath('/dashboard')
    revalidatePath('/transactions/sales')
    return { success: true }
  } catch {
    return { error: 'Failed to delete voucher.' }
  }
}