import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { PartyDetailClient } from '@/components/parties/PartyDetailClient'
import { ExportDropdown } from '@/components/shared/ExportDropdown'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  return { title: 'Party Ledger' }
}

export default async function PartyDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  // Find party and verify it belongs to this business
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
            orderBy: { voucher: { date: 'desc' } },
          },
        },
      },
    },
  })

  if (!party) notFound()

  // Compute running balance
  let runningBalance = 0
  const entries = party.ledger.entries.map((e) => {
    const signed = e.type === 'DEBIT' ? e.amount : -e.amount
    runningBalance += signed
    return {
      id: e.id,
      voucherId: e.voucher.id,
      voucherNumber: e.voucher.number,
      voucherType: e.voucher.type,
      date: e.voucher.date,
      notes: e.voucher.notes,
      entryType: e.type,
      amount: e.amount,
      balance: runningBalance,
    }
  })
  // reverse so most recent is first, but balance runs correctly
  const entriesChronological = [...entries].reverse()

  const closingBalance = party.ledger.entries.reduce(
    (s, e) => (e.type === 'DEBIT' ? s + e.amount : s - e.amount),
    0
  )

  const totalDebits = party.ledger.entries
    .filter((e) => e.type === 'DEBIT')
    .reduce((s, e) => s + e.amount, 0)
  const totalCredits = party.ledger.entries
    .filter((e) => e.type === 'CREDIT')
    .reduce((s, e) => s + e.amount, 0)

  const exportData = entriesChronological.map((e) => ({
    Date: new Date(e.date).toLocaleDateString('en-IN'),
    Voucher: e.voucherNumber,
    Type: e.voucherType,
    Description: e.notes ?? '',
    Debit: e.entryType === 'DEBIT' ? e.amount : '',
    Credit: e.entryType === 'CREDIT' ? e.amount : '',
    Balance: e.balance,
  }))

  const backHref =
    party.type === 'CUSTOMER' ? '/parties/customers' : '/parties/suppliers'

  return (
    <div className="w-full animate-fade-up">
      <div className="mb-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to {party.type === 'CUSTOMER' ? 'Customers' : 'Suppliers'}
        </Link>
      </div>

      <PageHeader
        title={party.name}
        subtitle={`${party.type === 'CUSTOMER' ? 'Customer' : 'Supplier'} · ${entriesChronological.length} transaction${entriesChronological.length !== 1 ? 's' : ''}`}
        badge={party.type === 'CUSTOMER' ? 'Customer' : 'Supplier'}
        actions={
          <ExportDropdown data={exportData} filename={`Ledger_${party.name.replace(/\s+/g, '_')}`} />
        }
      />

      <PartyDetailClient
        party={{
          id: party.id,
          name: party.name,
          type: party.type,
          email: party.email,
          phone: party.phone,
          gstin: party.gstin,
        }}
        entries={entriesChronological}
        summary={{
          totalDebits,
          totalCredits,
          closingBalance,
        }}
        currency={business.currency ?? 'INR'}
      />
    </div>
  )
}