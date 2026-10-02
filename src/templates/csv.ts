type Cell = string | number

export function serializeCSV(headers: string[], rows: Cell[][]) {
  function escape(value: Cell) {
    const text = String(value)
    // Spreadsheet applications may trim leading whitespace before interpreting a formula.
    const safe =
      typeof value === 'string' && (/^\s*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text))
        ? `'${text}`
        : text
    return `"${safe.replace(/"/g, '""')}"`
  }
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
}

export function downloadCSV(filename: string, headers: string[], rows: Cell[][]) {
  const csv = serializeCSV(headers, rows)
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.hidden = true
  document.body.append(anchor)
  try {
    anchor.click()
  } finally {
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
