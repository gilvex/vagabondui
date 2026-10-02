import { describe, expect, it } from 'vitest'
import { serializeCSV } from './csv'

describe('CSV exports', () => {
  it('quotes separators, quotes, and multiline content', () => {
    expect(serializeCSV(['Name', 'Note'], [['Acme, Inc.', 'He said "hello"\nNext line']])).toBe(
      '"Name","Note"\r\n"Acme, Inc.","He said ""hello""\nNext line"',
    )
  })
  it.each(['=1+1', '+SUM(1,2)', '-1+2', '@SUM(A1)', '  =1+1', '\t=1+1', '\rcommand', '\n=1+1'])(
    'neutralizes spreadsheet-formula text: %s',
    (value) => {
      expect(serializeCSV(['Value'], [[value]])).toContain(`"'${value}"`)
    },
  )
  it('preserves numeric cells rather than treating negative numbers as text formulas', () => {
    expect(serializeCSV(['Amount'], [[-12.5], [0], [120.5]])).toBe(
      '"Amount"\r\n"-12.5"\r\n"0"\r\n"120.5"',
    )
  })
})
