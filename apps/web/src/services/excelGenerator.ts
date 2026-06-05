export function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data available to export.')
    return
  }

  // Extract headers from the first object keys
  const headers = Object.keys(data[0])

  // Convert data to CSV format
  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header] === null || row[header] === undefined ? '' : String(row[header])
        return `"${val.replace(/"/g, '""')}"`
      })
      .join(',')
  )

  const csvContent = [headers.join(','), ...csvRows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}