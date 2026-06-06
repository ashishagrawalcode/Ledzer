import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { InvoicePrintView } from '@/components/invoices/InvoicePrintView'

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Invoice View · Ledzer` }
}

export default async function InvoiceViewerPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Fetch the invoice and the business details
  const voucher = await prisma.voucher.findUnique({
    where: { id: params.id },
    include: {
      business: true,
      entries: {
        include: { ledger: { include: { party: true } } }
      }
    }
  })

  if (!voucher || voucher.business.ownerId !== session.user.id) {
    redirect('/dashboard') // Security fallback
  }

  // Figure out who the customer is
  let customerName = 'Cash Customer'
  
  // Check if it was a Walk-in (we stored this in the notes)
  if (voucher.notes?.startsWith('Walk-in Sale: ')) {
    customerName = voucher.notes.replace('Walk-in Sale: ', '')
  } else {
    // Otherwise, find the party from the DEBIT entry
    const debitEntry = voucher.entries.find(e => e.type === 'DEBIT')
    if (debitEntry?.ledger?.party?.name) {
      customerName = debitEntry.ledger.party.name
    }
  }

  const items = Array.isArray(voucher.lineItems) ? voucher.lineItems : []

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <InvoicePrintView 
        voucher={voucher} 
        business={voucher.business} 
        customerName={customerName} 
        items={items} 
      />
    </div>
  )
}