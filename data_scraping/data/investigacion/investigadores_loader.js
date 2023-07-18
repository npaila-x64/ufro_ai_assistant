const fs = require('fs')

function escribirCSV(filename, data) {
    let csv = data.map(e => e.join(";")).join("\n")
    fs.writeFileSync(filename, csv)
}

let rawdata = fs.readFileSync('investigadores.json')
let unidades = JSON.parse(rawdata)

let data = []
data.push(['Unidad1','Unidad2','Investigador'])
let count = 0

for (let unidad1 of unidades) {
    for (let investigador of unidad1.investigadores) {
        data.push([unidad1.unidad, investigador.unidad, investigador.investigador])
    }
}

escribirCSV('investigadores.csv', data)
