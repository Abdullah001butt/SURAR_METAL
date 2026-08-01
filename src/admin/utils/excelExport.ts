import ExcelJS from 'exceljs'
import { sanitizeFilename } from '@/admin/utils/pdfExport'

const NAVY = 'FF0F172A'
const PRIMARY = 'FFFF5A1F'
const WHITE = 'FFFFFFFF'
const LIGHT_ROW = 'FFF8FAFC'
const BORDER_COLOR = 'FFE2E8F0'

export interface ExcelColumn<T> {
  header: string
  width?: number
  value: (row: T) => string | number | Date | null
  /** Return a fill color (ARGB) to highlight this specific cell, e.g. status badges */
  highlight?: (row: T) => string | null
}

interface SheetOptions<T> {
  title: string
  subtitle?: string
  sheetName?: string
  columns: ExcelColumn<T>[]
  rows: T[]
}

function addStyledSheet<T>(workbook: ExcelJS.Workbook, { title, subtitle, sheetName = 'Sheet1', columns, rows }: SheetOptions<T>) {
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', ySplit: subtitle ? 4 : 3 }],
    pageSetup: { orientation: 'landscape', fitToPage: true },
  })

  const colCount = Math.max(columns.length, 1)

  sheet.mergeCells(1, 1, 1, colCount)
  const titleCell = sheet.getCell(1, 1)
  titleCell.value = title
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: WHITE } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
  sheet.getRow(1).height = 32

  let headerRowIndex = 2
  if (subtitle) {
    sheet.mergeCells(2, 1, 2, colCount)
    const subCell = sheet.getCell(2, 1)
    subCell.value = subtitle
    subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: WHITE } }
    subCell.alignment = { vertical: 'middle', horizontal: 'left' }
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
    sheet.getRow(2).height = 20
    headerRowIndex = 3
  }

  sheet.getRow(headerRowIndex).height = 4
  headerRowIndex += 1

  const headerRow = sheet.getRow(headerRowIndex)
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = col.header
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: WHITE } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRIMARY } }
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
    cell.border = { bottom: { style: 'thin', color: { argb: PRIMARY } } }
  })
  headerRow.height = 22

  rows.forEach((row, rowIndex) => {
    const excelRow = sheet.getRow(headerRowIndex + 1 + rowIndex)
    const isEven = rowIndex % 2 === 1

    columns.forEach((col, colIndex) => {
      const cell = excelRow.getCell(colIndex + 1)
      const rawValue = col.value(row)
      cell.value = rawValue instanceof Date ? rawValue : (rawValue ?? '')
      if (rawValue instanceof Date) cell.numFmt = 'yyyy-mm-dd hh:mm'

      cell.font = { name: 'Calibri', size: 10.5, color: { argb: 'FF1E293B' } }
      cell.alignment = { vertical: 'middle', wrapText: true }
      cell.border = {
        top: { style: 'hair', color: { argb: BORDER_COLOR } },
        bottom: { style: 'hair', color: { argb: BORDER_COLOR } },
      }

      const highlight = col.highlight?.(row)
      if (highlight) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: highlight } }
        cell.font = { ...cell.font, bold: true }
      } else if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_ROW } }
      }
    })
    excelRow.height = 20
  })

  columns.forEach((col, i) => {
    sheet.getColumn(i + 1).width = col.width ?? Math.max(14, col.header.length + 4)
  })

  if (rows.length > 0) {
    sheet.autoFilter = {
      from: { row: headerRowIndex, column: 1 },
      to: { row: headerRowIndex, column: colCount },
    }
  }
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFilename(filename)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

interface ExcelExportOptions<T> extends SheetOptions<T> {
  filename: string
}

export async function exportStyledExcel<T>({ filename, ...sheetOptions }: ExcelExportOptions<T>) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Al Surur General Store Equipment Trading LLC'
  workbook.created = new Date()
  addStyledSheet(workbook, sheetOptions)
  await downloadWorkbook(workbook, filename)
}

export interface BackupSheet<T> extends SheetOptions<T> {}

export async function exportMultiSheetBackup(sheets: BackupSheet<unknown>[], filename: string) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Al Surur General Store Equipment Trading LLC'
  workbook.created = new Date()
  for (const sheet of sheets) addStyledSheet(workbook, sheet)
  await downloadWorkbook(workbook, filename)
}

export const STATUS_COLORS: Record<string, string> = {
  new: 'FFDBEAFE',
  contacted: 'FFFEF3C7',
  quoted: 'FFEDE9FE',
  won: 'FFD1FAE5',
  lost: 'FFFEE2E2',
  draft: 'FFF1F5F9',
  sent: 'FFDBEAFE',
  paid: 'FFD1FAE5',
  overdue: 'FFFEE2E2',
}
