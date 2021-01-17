function getMappedRow(row, keys) {
  let mappedRow = {}

  row.forEach((value, colNum) => {
    let key = keys[colNum]
    mappedRow[key] = value
  })

  return mappedRow
}

function mapEntries(sheetData) {

  let rowKeys = null // e.g. [1] = 'name', [2] = 'oxbridge'
  let row = []
  let mapped = []

  sheetData.feed.entry.forEach( entry => {
    // If this cell is at col 1, handle previous x cells
    const rowNum = parseInt(entry.gs$cell.row)
    const colNum = parseInt(entry.gs$cell.col)
    const gotFirstRow = rowNum === 2 && colNum === 1
    const gotAnotherRow = rowNum > 2 && colNum === 1

    // Handle first row e.g. [1] = 'name', [2] = 'oxbridge'
    if (gotFirstRow) {
      rowKeys = row
      row = []
    }

    // Handle data row e.g. [1] = 'Rhian Jones', [7] = 'f', [9] = 'Lancaster University'
    if (gotAnotherRow) {
      mapped.push(getMappedRow(row, rowKeys))
      row = []
    }

    // Append this cell to the row at its given index
    row[colNum] = entry.content.$t
  })

  // Push the final row
  mapped.push(getMappedRow(row, rowKeys))

  return mapped;
}

exports.getSheetAsArray = async (sheetId) => {
  return fetch(`https://spreadsheets.google.com/feeds/cells/${sheetId}/1/public/full?alt=json`)
    .then(response => response.json())
    .then(data => mapEntries(data))
}