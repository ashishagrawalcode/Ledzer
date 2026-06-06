'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@ledzer/database'
import { revalidatePath } from 'next/cache'

interface InvoicePayload {
  businessId: string
  partyId?: string 
  walkInName?: string 
  items: any[]
  taxRate: number
  totalTax: number
  netAmount: number
}

export async function createInvoice(data: InvoicePayload) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    let debitLedgerId = ''

    // 1. Determine who is getting Debited (Customer or Cash Account)
    if (data.partyId) {
      const party = await prisma.party.findUnique({ where: { id: data.partyId }})
      if (!party) throw new Error('Customer not found')
      debitLedgerId = party.ledgerId
    } else {
      let cashLedger = await prisma.ledger.findFirst({
        where: { businessId: data.businessId, name: 'Cash Account', group: 'ASSET' }
      })
      if (!cashLedger) {
        cashLedger = await prisma.ledger.create({
          data: { businessId: data.businessId, name: 'Cash Account', group: 'ASSET', isSystem: true }
        })
      }
      debitLedgerId = cashLedger.id
    }

    // 2. Find or Create the Sales Ledger
    let salesLedger = await prisma.ledger.findFirst({
      where: { businessId: data.businessId, group: 'INCOME', name: 'Sales Account' }
    })
    if (!salesLedger) {
      salesLedger = await prisma.ledger.create({
        data: { businessId: data.businessId, name: 'Sales Account', group: 'INCOME', isSystem: true }
      })
    }

    const invoiceNumber = `INV-${Math.floor(Date.now() / 1000)}`
    const finalNotes = data.walkInName ? `Walk-in Sale: ${data.walkInName}` : 'Standard Sales Invoice'

    // 3. Save the Voucher AND Update Inventory in a Transaction
    const voucher = await prisma.$transaction(async (tx) => {
      // A. Create the invoice
      const createdVoucher = await tx.voucher.create({
        data: {
          businessId: data.businessId,
          type: 'SALES',
          number: invoiceNumber,
          date: new Date(),
          notes: finalNotes,
          taxRate: data.taxRate,
          totalTax: data.totalTax,
          netAmount: data.netAmount,
          lineItems: data.items,
          entries: {
            create: [
              { ledgerId: debitLedgerId, type: 'DEBIT', amount: data.netAmount },
              { ledgerId: salesLedger.id, type: 'CREDIT', amount: data.netAmount }
            ]
          }
        }
      })

      // B. Deduct Inventory Stock (The Foolproof Way)
      for (const item of data.items) {
        if (item.productId && item.qty > 0) {
          
          // Step 1: Read the current product inside the transaction lock
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          })

          if (product) {
            // Step 2: Handle PostgreSQL nulls by forcing a fallback to 0
            const currentStock = product.stock ?? 0
            const newStock = currentStock - Number(item.qty)

            // Step 3: Hard-set the exact new stock number
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: newStock }
            })
          }
        }
      }

      return createdVoucher
    })

    revalidatePath('/invoices')
    revalidatePath('/transactions/sales')
    revalidatePath('/inventory') // Force inventory UI to update
    
    return { success: true, id: voucher.id }
  } catch (error: any) {
    console.error("Invoice Creation Error:", error)
    return { success: false, error: error.message }
  }
}