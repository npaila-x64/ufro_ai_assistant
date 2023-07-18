const puppeteer = require('puppeteer')
const fs = require('fs')
const config = require('../config')

function escribirJSON(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data))
}

let rawdata = fs.readFileSync(config.investigacion_data_folder + '/apoyos.json')
let apoyos = JSON.parse(rawdata)

let contextos = []

for (let categoria of apoyos) {
    for (let apoyo of categoria.apoyos) {
        let contexto = {
            tipo_apoyo: categoria.tipo_apoyo,
            motivo: categoria.descripcion,
            url: apoyo.url,
            estado: apoyo.estado
        } 
        contextos.push(contexto)
    }
}

function obtenerDatos(contextos) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()

            let results = []

            for (let contexto of contextos) {
                console.log(`scrapeando url [${results.length + 1}/${contextos.length}]: ${contexto.url}`)
                await page.goto(contexto.url, {waitUntil: 'load', timeout: 90000})
                let script = await page.evaluate(() => {

                    let descripcion = ''
                    let descripciones = document.querySelector('.elementor-widget-theme-post-content')
                    if (descripciones != null) {
                        for (let p of descripciones.querySelectorAll('p')) {
                            descripcion += p.textContent + '\n'
                        }
                    }

                    let detalles = {}

                    let divs = document.querySelectorAll('.elementor-section.elementor-top-section.elementor-element.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default')
                    let anexos = divs[4].querySelectorAll('.elementor-column.elementor-col-50.elementor-top-column.elementor-element')[1]
                    let table = divs[4].querySelectorAll('.elementor-column.elementor-col-50.elementor-top-column.elementor-element')[0]
                    let rows = table.querySelectorAll('.elementor-section.elementor-inner-section.elementor-element.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default:not([style="display: none;"])')
                    for (let row of rows) {
                        let rowData = row.querySelectorAll('.elementor-column.elementor-col-50.elementor-inner-column.elementor-element')
                        let value = rowData[1].querySelector('.text-content-block')
                        if (value == null) {
                            value = rowData[1].querySelector('a').textContent
                        } else {
                            value = value.textContent
                        }
                        detalles[rowData[0].querySelector('.text-content-block').textContent] = value
                    }

                    let url_bases = ""

                    let links = document.querySelectorAll('.plus-custom-field-wrap')
                    for (let link of links) {
                        if (link.textContent === 'Bases del Concurso') {
                            if (link.getAttribute('href').startsWith('https')) {
                                url_bases = link.getAttribute('href')
                            }
                        }
                    }

                    let data = {
                        url: window.location.href,
                        titulo: document.querySelector('.elementor-heading-title').textContent,
                        descripcion: descripcion,
                        detalles: detalles,
                        url_bases: url_bases
                    }
                    
                    return data
                })
                let data = script
                data.estado = contexto.estado
                data.tipo_apoyo = contexto.tipo_apoyo
                data.motivo = contexto.motivo
                results.push(data)
            }
            
            browser.close()
            return resolve(results)
        } catch (e) {
            return reject(e)
        }
    }).catch((err) => console.error(err))
}

function run() {
    obtenerDatos(contextos).then(datos => {
        console.log('escribiendo datos a sistema')
        escribirJSON(config.investigacion_data_folder + '/apoyos.json', datos)
    })
}

run()