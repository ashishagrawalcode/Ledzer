'use server'

import { prisma as db } from '@ledzer/database'
import { revalidatePath } from 'next/cache'

interface OnboardingData {
  userId: string
  name: string
  gstin?: string
  currency: string
  fiscalYearStart: Date
}

export async function saveBusinessOnboarding(data: OnboardingData) {
  try {
    if (!data.name?.trim()) {
      return { error: 'Business name is required' }
    }

    const existing = await db.business.findFirst({
      where: { ownerId: data.userId },
    })

    if (existing) {
      // Update only missing/provided fields
      await db.business.update({
        where: { id: existing.id },
        data: {
          name: data.name.trim(),
          ...(data.gstin ? { gstin: data.gstin.trim() } : {}),
          currency: data.currency,
          fiscalYearStart: data.fiscalYearStart,
        },
      })
    } else {
      // Create new business with default system ledgers
      await db.$transaction(async (tx) => {
        const business = await tx.business.create({
          data: {
            name: data.name.trim(),
            gstin: data.gstin?.trim() ?? null,
            ownerId: data.userId,
            currency: data.currency,
            fiscalYearStart: data.fiscalYearStart,
          },
        })

        // Create system ledgers
        const systemLedgers = [
          { name: 'Cash', group: 'ASSET' as const },
          { name: 'Bank Account', group: 'ASSET' as const },
          { name: 'Sales', group: 'INCOME' as const },
          { name: 'Purchases', group: 'EXPENSE' as const },
          { name: 'Profit & Loss', group: 'EQUITY' as const },
          { name: 'Capital Account', group: 'EQUITY' as const },
        ]

        await tx.ledger.createMany({
          data: systemLedgers.map((l) => ({
            ...l,
            businessId: business.id,
            isSystem: true,
          })),
        })
      })
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Onboarding error:', error)
    return { error: 'Failed to save business details. Please try again.' }
  }
}