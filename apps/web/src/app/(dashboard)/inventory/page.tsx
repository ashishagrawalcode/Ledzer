import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { InventoryClient } from '@/components/inventory/InventoryClient'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Inventory' }

export default async function InventoryPage({ searchParams }: { searchParams: { search?: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  const search = searchParams.search?.trim() ?? ''

  const products = await prisma.product.findMany({
    where: {
      businessId: business.id,
      ...(search ? { OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku:  { contains: search, mode: 'insensitive' } },
      ]} : {}),
    },
    orderBy: { name: 'asc' },
  })

  const lowStockCount = products.filter(
    (p) => p.reorderLevel !== null && p.stock !== null && p.stock <= p.reorderLevel
  ).length

  return (
    <div className="w-full animate-fade-up">
      <PageHeader
        title="Inventory"
        subtitle={`${products.length} product${products.length !== 1 ? 's' : ''}${lowStockCount > 0 ? ` · ${lowStockCount} low stock` : ''}`}
        badge="Inventory"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={products} filename="Inventory_Status" />
            <Link href="/inventory/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-glow">
              <Plus size={15} />Add Product
            </Link>
          </div>
        }
      />
      <InventoryClient
        products={products.map((p) => ({
          id: p.id, name: p.name, sku: p.sku, unit: p.unit,
          stock: p.stock, reorderLevel: p.reorderLevel,
          salePrice: p.salePrice, purchasePrice: p.purchasePrice,
          taxRate: p.taxRate,
        }))}
        currency={business.currency ?? 'INR'}
        search={search}
      />
    </div>
  )
}