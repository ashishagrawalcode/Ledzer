import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface InvoicePDFData {
  businessName: string
  partyName: string
  voucherNumber: string
  date: string
  currency: string
  amount: number
  notes?: string | null
  type: string
}

export function generateInvoicePDF(data: InvoicePDFData) {
  const doc = new jsPDF()

  // Branding Colors
  const primaryColor = [20, 241, 149] as [number, number, number] // Teal

  // Header
  doc.setFontSize(22)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text(data.businessName, 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Voucher: ${data.voucherNumber}`, 14, 28)
  doc.text(`Date: ${data.date}`, 14, 34)

  // Recipient
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Bill To:', 14, 50)
  doc.setFont('helvetica', 'bold')
  doc.text(data.partyName, 14, 56)

  // Table
  autoTable(doc, {
    startY: 70,
    head: [['Description', 'Amount']],
    body: [
      [`${data.type} Transaction`, `${data.currency} ${data.amount.toFixed(2)}`]
    ],
    theme: 'striped',
    headStyles: { fillColor: primaryColor }
  })

  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 100
  doc.setFontSize(14)
  doc.text(`Total: ${data.currency} ${data.amount.toFixed(2)}`, 14, finalY + 15)

  doc.save(`${data.voucherNumber}.pdf`)
}