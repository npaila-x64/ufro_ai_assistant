const fs = require('fs')
const readline = require('readline')

// Reads a plain text file and returns an array with its lines
const readLines = filename => {
  return new Promise((resolve, reject) => {
    let lines = []

    const reader = readline.createInterface({
      input: fs.createReadStream(filename),
      output: process.stdout,
      terminal: false
    })

    reader.on('line', (line) => {
      lines.push(line);
    })

    reader.on('close', () => resolve(lines))

    reader.on('error', err => reject(err))
  })
}

module.exports = { readLines }
