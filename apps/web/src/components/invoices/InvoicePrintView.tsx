'use client'

import { Printer, ArrowLeft, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InvoicePrintViewProps {
  voucher: any
  business: any
  customerName: string
  items: any[]
}

export function InvoicePrintView({ voucher, business, customerName, items }: InvoicePrintViewProps) {
  const router = useRouter()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Action Bar - Hidden during printing */}
      <div className="print:hidden flex items-center justify-between bg-[#050505] border border-white/10 p-4 rounded-2xl shadow-xl">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-navy font-bold text-sm hover:bg-teal-hover transition-all shadow-[0_0_20px_rgba(20,241,149,0.15)]"
          >
            <Download size={16} /> Save as PDF / Print
          </button>
        </div>
      </div>

      {/* The Actual Invoice Document */}
      {/* Tailwind 'print:' utilities ensure this looks like a normal piece of paper when exported */}
      <div className="bg-white text-black p-8 sm:p-12 rounded-2xl shadow-2xl print:shadow-none print:p-0 mx-auto max-w-3xl min-h-[800px] print:min-h-0 relative overflow-hidden">
        
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/10 rounded-bl-full -z-10 print:hidden" />

        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{business.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Generated via Ledzer</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-teal-600 mb-1">INVOICE</h2>
            <p className="text-sm text-gray-600 font-medium">{voucher.number}</p>
            <p className="text-sm text-gray-500 mt-2">
              Date: {new Date(voucher.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To</h3>
          <p className="text-lg font-semibold text-gray-800">{customerName}</p>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8 text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Description</th>
              <th className="py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Qty</th>
              <th className="py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Price</th>
              <th className="py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, index) => {
              const itemTotal = (item.qty || 0) * (item.price || 0)
              return (
                <tr key={index} className="group">
                  <td className="py-4 text-sm font-medium text-gray-800">{item.description || 'Item'}</td>
                  <td className="py-4 text-sm text-gray-600 text-center">{item.qty}</td>
                  <td className="py-4 text-sm text-gray-600 text-right">{business.currency} {Number(item.price).toFixed(2)}</td>
                  <td className="py-4 text-sm font-semibold text-gray-800 text-right">{business.currency} {itemTotal.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end border-t border-gray-200 pt-6">
          <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">{business.currency} {(voucher.netAmount - voucher.totalTax).toFixed(2)}</span>
            </div>
            
            {voucher.totalTax > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax ({voucher.taxRate}%)</span>
                <span className="font-medium">+ {business.currency} {voucher.totalTax.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t-2 border-gray-900 pt-3 mt-3">
              <span className="font-bold text-gray-800">Net Amount</span>
              <span className="text-xl font-black text-teal-600">{business.currency} {voucher.netAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 font-medium print:mt-auto print:absolute print:bottom-8 print:left-0 print:right-0">
          <p>Thank you for your business.</p>
        </div>
      </div>
    </div>
  )
}