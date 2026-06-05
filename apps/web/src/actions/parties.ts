'use server'

import { prisma as db } from '@ledzer/database'
import { revalidatePath } from 'next/cache'

export async function createParty(input: {
  businessId: string
  name: string
  type: 'CUSTOMER' | 'SUPPLIER'
  email?: string
  phone?: string
  gstin?: string
  openingBalance?: number
  openingType?: 'DEBIT' | 'CREDIT'
}) {
  try {
    if (!input.name?.trim()) return { error: 'Name is required' }

    const existing = await db.party.findFirst({
      where: { businessId: input.businessId, name: { equals: input.name.trim(), mode: 'insensitive' }, type: input.type },
    })
    if (existing) return { error: `A ${input.type.toLowerCase()} named "${input.name}" already exists.` }

    await db.$transaction(async (tx) => {
      // Create hidden ledger for this party
      const ledger = await tx.ledger.create({
        data: {
          businessId: input.businessId,
          name: input.name.trim(),
          group: input.type === 'CUSTOMER' ? 'ASSET' : 'LIABILITY',
          isSystem: false,
        },
      })

      // Create party linked to ledger
      const party = await tx.party.create({
        data: {
          businessId: input.businessId,
          name: input.name.trim(),
          type: input.type,
          email: input.email?.trim() || null,
          phone: input.phone?.trim() || null,
          gstin: input.gstin?.trim() || null,
          ledgerId: ledger.id,
        },
      })

      // Opening balance entry
      if (input.openingBalance && input.openingBalance > 0) {
        let obLedger = await tx.ledger.findFirst({
          where: { businessId: input.businessId, name: 'Opening Balance', isSystem: true },
        })
        if (!obLedger) {
          obLedger = await tx.ledger.create({
            data: { businessId: input.businessId, name: 'Opening Balance', group: 'EQUITY', isSystem: true },
          })
        }
        const entryType = input.openingType ?? (input.type === 'CUSTOMER' ? 'DEBIT' : 'CREDIT')
        const oppositeType = entryType === 'DEBIT' ? 'CREDIT' : 'DEBIT'
        await tx.voucher.create({
          data: {
            businessId: input.businessId,
            type: 'JOURNAL',
            number: `OB-${party.id.slice(-4)}`,
            date: new Date(),
            notes: `Opening balance for ${input.name}`,
            entries: {
              create: [
                { ledgerId: ledger.id, type: entryType, amount: input.openingBalance },
                { ledgerId: obLedger.id, type: oppositeType, amount: input.openingBalance },
              ],
            },
          },
        })
      }

      return party
    })

    revalidatePath('/parties/customers')
    revalidatePath('/parties/suppliers')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Create party error:', error)
    return { error: 'Failed to create party. Please try again.' }
  }
}