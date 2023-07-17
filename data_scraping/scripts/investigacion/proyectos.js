const puppeteer = require('puppeteer')
const FileSystem = require('fs')
const config = require('../config')
const { readLines } = require('./readLines')

function sleep(ms) {    
    return new Promise(resolve => setTimeout(resolve, ms))
}

function escribirJSON(filename, data) {
    FileSystem.writeFileSync(filename, JSON.stringify(data))
}

function obtenerDatos(urls) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()

            let results = []

            for (let url of urls) {
                console.log(`scrapeando url [${results.length + 1}/${urls.length}]: ${url}`)
                await page.goto(url, {waitUntil: 'load', timeout: 90000})
                let script = await page.evaluate(() => {

                    let descripcion = ''
                    let descripciones = document.querySelector('.elementor-widget-theme-post-content')
                    if (descripciones !== null) {
                        for (let p of descripciones.querySelectorAll('p')) {
                            descripcion += p.textContent + '\n'
                        }
                    }

                    let detalles = []

                    let divs = document.querySelectorAll('.elementor-section.elementor-top-section.elementor-element.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default')
                    let links = divs[4].querySelectorAll('.elementor-column.elementor-col-50.elementor-top-column.elementor-element')[1]
                    let table = divs[4].querySelectorAll('.elementor-column.elementor-col-50.elementor-top-column.elementor-element')[0]
                    let rows = table.querySelectorAll('.elementor-section.elementor-inner-section.elementor-element.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default:not([style="display: none;"])')
                    for (let row of rows) {
                        let detalle = {}
                        let rowData = row.querySelectorAll('.elementor-column.elementor-col-50.elementor-inner-column.elementor-element')
                        detalle[rowData[0].querySelector('.text-content-block').textContent] = rowData[1].querySelector('.text-content-block').textContent
                        detalles.push(detalle)
                    }

                    let data = {
                        url: window.location.href,
                        titulo: document.querySelector('.elementor-heading-title').textContent,
                        descripcion: descripcion,
                        detalles: detalles
                    }
                    
                    return data
                })
                results.push(script)
            }
            
            browser.close()
            return resolve(results)
        } catch (e) {
            return reject(e)
        }
    }).catch((err) => console.error(err))
}

function run() {
    readLines('scripts/investigacion/oferta_de_proyectos.txt')
        .then(urls => {
            obtenerDatos(urls).then(datos => {
                console.log('escribiendo datos a sistema')
                escribirJSON(config.investigacion_data_folder + '/oferta_de_proyectos.json', datos)
            })
        })
        .catch(err => console.error(err))
}

run()