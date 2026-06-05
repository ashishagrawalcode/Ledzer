'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@ledzer/database'
import { revalidatePath } from 'next/cache'

export interface SettingsInput {
  name: string
  gstin: string | null
  currency: string
  fiscalYearStart: string | null
}

export async function updateBusinessSettings(data: {
  name: string
  gstin: string | null
  currency: string
  fiscalYearStart: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized.' }
  if (!data.name?.trim()) return { success: false, error: 'Business name is required.' }

  try {
    const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } })
    if (!business) return { success: false, error: 'Business not found.' }

    await prisma.business.update({
      where: { id: business.id },
      data: {
        name: data.name.trim(),
        gstin: data.gstin?.trim() || null,
        currency: data.currency,
        fiscalYearStart: data.fiscalYearStart ? new Date(data.fiscalYearStart) : null,
      },
    })

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    console.error('Settings update error:', e)
    return { success: false, error: 'Failed to save settings.' }
  }
}