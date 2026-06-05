import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { PartyLedgerClient } from '@/components/parties/PartyLedgerClient'
import { format } from 'date-fns'

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: 'Party Ledger · Ledzer' }
}

export default async function PartyLedgerPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!business) redirect('/dashboard')

  // Fetch party with its ledger
  const party = await prisma.party.findFirst({
    where: { id: params.id, businessId: business.id },
    include: {
      ledger: {
        include: {
          entries: {
            include: {
              voucher: {
                select: { id: true, number: true, type: true, date: true, notes: true },
              },
            },
            orderBy: { voucher: { date: 'asc' } },
          },
        },
      },
    },
  })

  if (!party) notFound()

  // Build running balance ledger
  let balance = 0
  const ledgerRows = party.ledger.entries.map((entry) => {
    const debit = entry.type === 'DEBIT' ? entry.amount : 0
    const credit = entry.type === 'CREDIT' ? entry.amount : 0
    balance += debit - credit
    return {
      id: entry.id,
      date: format(new Date(entry.voucher.date), 'dd MMM yyyy'),
      voucherNumber: entry.voucher.number,
      voucherType: entry.voucher.type,
      notes: entry.voucher.notes ?? null,
      debit: debit || null,
      credit: credit || null,
      balance,
    }
  })

  // Summary
  const totalDebit = party.ledger.entries.filter(e => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0)
  const totalCredit = party.ledger.entries.filter(e => e.type === 'CREDIT').reduce((s, e) => s + e.amount, 0)
  const closingBalance = totalDebit - totalCredit

  return (
    <div className="w-full animate-fade-up space-y-6">
      <PageHeader
        title={party.name}
        subtitle={`${party.type === 'CUSTOMER' ? 'Customer' : 'Supplier'} · ${party.email ?? 'N/A'} · ${party.phone ?? 'N/A'}`}
        badge={party.type === 'CUSTOMER' ? 'Customer' : 'Supplier'}
        backHref={party.type === 'CUSTOMER' ? '/parties/customers' : '/parties/suppliers'}
      />
      <PartyLedgerClient
        party={{
          id: party.id,
          name: party.name,
          type: party.type,
          email: party.email ?? null,
          phone: party.phone ?? null,
          gstin: party.gstin ?? null,
        }}
        ledgerRows={ledgerRows}
        totalDebit={totalDebit}
        totalCredit={totalCredit}
        closingBalance={closingBalance}
        currency={business.currency ?? 'INR'}
      />
    </div>
  )
}