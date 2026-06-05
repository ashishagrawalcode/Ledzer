'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { downloadCSV } from '@/services/excelGenerator'
import { generateInvoicePDF } from '@/services/pdfGenerator'

interface ExportDropdownProps {
  data: any[]
  filename: string
  // Optional: Pass specific invoice data if you want the PDF option to generate a single invoice
  singleInvoiceData?: any 
}

export function ExportDropdown({ data, filename, singleInvoiceData }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-accent text-foreground font-semibold text-sm hover:bg-foreground/5 transition-all duration-200 shadow-sm"
      >
        <Download size={15} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 glass-heavy rounded-xl border border-border shadow-card-hover overflow-hidden z-50 animate-slide-down">
          <div className="p-1.5 flex flex-col gap-1">
            
            {/* CSV Export Option */}
            <button
              onClick={() => {
                downloadCSV(data, filename)
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors duration-150 text-left"
            >
              <FileSpreadsheet size={15} className="text-teal" />
              Export as CSV
            </button>

            {/* Optional PDF Export Option */}
            {singleInvoiceData && (
              <button
                onClick={() => {
                  generateInvoicePDF(singleInvoiceData)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors duration-150 text-left"
              >
                <FileText size={15} className="text-blue-400" />
                Download PDF
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  )
}