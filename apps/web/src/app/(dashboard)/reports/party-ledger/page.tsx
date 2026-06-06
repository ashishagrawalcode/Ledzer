import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { PartyLedgerClient } from '@/components/reports/PartyLedgerClient'

export const metadata = { title: 'Party Ledger' }

export default async function PartyLedgerPage({
  searchParams,
}: {
  searchParams: { partyId?: string; from?: string; to?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  // All parties for the dropdown
  const allParties = await prisma.party.findMany({
    where: { businessId: business.id },
    select: { id: true, name: true, type: true },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  })

  // If a party is selected, fetch its ledger entries with date filter
  let selectedPartyData = null
  if (searchParams.partyId) {
    const now = new Date()
    const fyStart = business.fiscalYearStart
      ? new Date(business.fiscalYearStart)
      : new Date(now.getFullYear(), 3, 1)

    const fromDate = searchParams.from ? new Date(searchParams.from) : fyStart
    const toDate = searchParams.to ? new Date(searchParams.to) : now

    const party = await prisma.party.findFirst({
      where: { id: searchParams.partyId, businessId: business.id },
      include: {
        ledger: {
          include: {
            entries: {
              where: { voucher: { date: { gte: fromDate, lte: toDate } } },
              include: {
                voucher: { select: { id: true, number: true, type: true, date: true, notes: true } },
              },
              orderBy: { voucher: { date: 'asc' } },
            },
          },
        },
      },
    })

    if (party) {
      let running = 0
      const entries = party.ledger.entries.map((e) => {
        running += e.type === 'DEBIT' ? e.amount : -e.amount
        return {
          id: e.id,
          voucherId: e.voucher.id,
          voucherNumber: e.voucher.number,
          voucherType: e.voucher.type,
          date: e.voucher.date,
          notes: e.voucher.notes,
          entryType: e.type,
          amount: e.amount,
          balance: running,
        }
      })

      const totalDebits = entries.filter((e) => e.entryType === 'DEBIT').reduce((s, e) => s + e.amount, 0)
      const totalCredits = entries.filter((e) => e.entryType === 'CREDIT').reduce((s, e) => s + e.amount, 0)

      selectedPartyData = {
        party: { id: party.id, name: party.name, type: party.type, email: party.email, phone: party.phone, gstin: party.gstin },
        entries,
        summary: { totalDebits, totalCredits, closingBalance: running },
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      }
    }
  }

  return (
    <div className="w-full animate-fade-up">
      <PageHeader
        title="Party Ledger"
        subtitle="Statement for any customer or supplier"
        badge="Reports"
      />
      <PartyLedgerClient
        allParties={allParties}
        selectedPartyData={selectedPartyData}
        currency={business.currency ?? 'INR'}
        selectedPartyId={searchParams.partyId ?? null}
        fromDate={searchParams.from ?? null}
        toDate={searchParams.to ?? null}
      />
    </div>
  )
}