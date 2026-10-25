export function surveyTable(
  parent: HTMLElement,
  columns: string[],
  rows: string[][],
) {
  const scroll = document.createElement('div')
  scroll.style.overflowX = 'auto'
  const table = document.createElement('table')
  const head = table.createTHead().insertRow()
  for (const column of columns) {
    const cell = document.createElement('th')
    cell.scope = 'col'
    cell.textContent = column
    head.append(cell)
  }
  const body = table.createTBody()
  for (const values of rows) {
    const row = body.insertRow()
    for (const value of values) row.insertCell().textContent = value
  }
  scroll.append(table)
  parent.append(scroll)
}
