'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@ledzer/database'
import { revalidatePath } from 'next/cache'

interface ProductPayload {
  name: string
  sku: string | null
  unit: string | null
  stock: number | null
  reorderLevel: number | null
  salePrice: number | null
  purchasePrice: number | null
  taxRate: number | null
}

async function getBusinessId(userId: string) {
  const business = await prisma.business.findFirst({ where: { ownerId: userId } })
  return business?.id ?? null
}

export async function createProduct(data: ProductPayload) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized.' }

  const businessId = await getBusinessId(session.user.id)
  if (!businessId) return { success: false, error: 'Business not found.' }

  if (!data.name?.trim()) return { success: false, error: 'Product name is required.' }

  try {
    await prisma.product.create({
      data: {
        businessId,
        name: data.name.trim(),
        sku: data.sku || null,
        unit: data.unit || null,
        stock: data.stock ?? 0,
        reorderLevel: data.reorderLevel,
        salePrice: data.salePrice,
        purchasePrice: data.purchasePrice,
        taxRate: data.taxRate,
      },
    })
    revalidatePath('/inventory')
    return { success: true }
  } catch (e) {
    console.error('Create product error:', e)
    return { success: false, error: 'Failed to create product.' }
  }
}

export async function updateProduct(id: string, data: ProductPayload) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized.' }

  const businessId = await getBusinessId(session.user.id)
  if (!businessId) return { success: false, error: 'Business not found.' }

  if (!data.name?.trim()) return { success: false, error: 'Product name is required.' }

  try {
    // Verify ownership
    const product = await prisma.product.findFirst({ where: { id, businessId } })
    if (!product) return { success: false, error: 'Product not found.' }

    await prisma.product.update({
      where: { id },
      data: {
        name: data.name.trim(),
        sku: data.sku || null,
        unit: data.unit || null,
        stock: data.stock ?? 0,
        reorderLevel: data.reorderLevel,
        salePrice: data.salePrice,
        purchasePrice: data.purchasePrice,
        taxRate: data.taxRate,
      },
    })
    revalidatePath('/inventory')
    return { success: true }
  } catch (e) {
    console.error('Update product error:', e)
    return { success: false, error: 'Failed to update product.' }
  }
}

export async function deleteProduct(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized.' }

  const businessId = await getBusinessId(session.user.id)
  if (!businessId) return { success: false, error: 'Business not found.' }

  try {
    const product = await prisma.product.findFirst({ where: { id, businessId } })
    if (!product) return { success: false, error: 'Product not found.' }

    await prisma.product.delete({ where: { id } })
    revalidatePath('/inventory')
    return { success: true }
  } catch (e) {
    console.error('Delete product error:', e)
    return { success: false, error: 'Failed to delete product.' }
  }
}