'use server'

import { prisma as db } from '@ledzer/database'
import { revalidatePath } from 'next/cache'

export async function createLedger(input: {
  businessId: string
  name: string
  group: string
  openingBalance?: number
  openingType?: 'DEBIT' | 'CREDIT'
}) {
  try {
    const existing = await db.ledger.findFirst({
      where: { businessId: input.businessId, name: { equals: input.name, mode: 'insensitive' } },
    })
    if (existing) return { error: `A ledger named "${input.name}" already exists.` }

    const ledger = await db.ledger.create({
      data: {
        businessId: input.businessId,
        name: input.name,
        group: input.group as never,
        isSystem: false,
      },
    })

    // Create opening balance entry if provided
    if (input.openingBalance && input.openingBalance > 0) {
      // Find or create an Opening Balance equity ledger
      let obLedger = await db.ledger.findFirst({
        where: { businessId: input.businessId, name: 'Opening Balance', isSystem: true },
      })
      if (!obLedger) {
        obLedger = await db.ledger.create({
          data: { businessId: input.businessId, name: 'Opening Balance', group: 'EQUITY', isSystem: true },
        })
      }

      const oppositeType = input.openingType === 'DEBIT' ? 'CREDIT' : 'DEBIT'
      await db.voucher.create({
        data: {
          businessId: input.businessId,
          type: 'JOURNAL',
          number: `OB-${ledger.id.slice(-4)}`,
          date: new Date(),
          notes: `Opening balance for ${input.name}`,
          entries: {
            create: [
              { ledgerId: ledger.id, type: input.openingType!, amount: input.openingBalance },
              { ledgerId: obLedger.id, type: oppositeType, amount: input.openingBalance },
            ],
          },
        },
      })
    }

    revalidatePath('/masters/ledgers')
    revalidatePath('/dashboard')
    return { success: true, ledgerId: ledger.id }
  } catch (error) {
    console.error('Create ledger error:', error)
    return { error: 'Failed to create ledger. Please try again.' }
  }
}

export async function deleteLedger(id: string, businessId: string) {
  try {
    const ledger = await db.ledger.findFirst({ where: { id, businessId }, include: { entries: true } })
    if (!ledger) return { error: 'Ledger not found' }
    if (ledger.isSystem) return { error: 'System ledgers cannot be deleted.' }
    if (ledger.entries.length > 0) return { error: 'Cannot delete a ledger with existing transactions. Remove all entries first.' }

    await db.ledger.delete({ where: { id } })
    revalidatePath('/masters/ledgers')
    return { success: true }
  } catch {
    return { error: 'Failed to delete ledger.' }
  }
}