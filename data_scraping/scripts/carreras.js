const puppeteer = require('puppeteer')
const FileSystem = require('fs')

const dataFolder = 'data'

function escribirJSON(filename, data) {
    FileSystem.writeFileSync(filename, JSON.stringify(data))
}

function obtenerCarreras () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()

            await page.goto('https://admision.ufro.cl/carreras-temuco/')

            let script = await page.evaluate(() => {
                let tabla = document.querySelector('.entry')
                let facultades = tabla.querySelectorAll('.col-12')
                let data = []
                facultades.forEach(facultad => {
                    let carrerasTabla = facultad.querySelectorAll('[href]')
                    let carreras = []

                    for (let carrera of carrerasTabla) {
                        carreras.push({
                            titulo_carrera: carrera.innerText,
                            url: carrera.getAttribute('href')
                        })
                    }

                    data.push({
                        titulo_facultad: facultad.querySelector('h2').innerText,
                        carreras: carreras,
                    })
                })
                return data
            })

            browser.close()
            return resolve(script)
        } catch (e) {
            return reject(e)
        }
    }).catch((err) => console.error(err))
}

function obtenerInfo (facultades) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()

            let results = []

            for (let facultad of facultades) {
                for (let carrera of facultad['carreras']) {
                    console.log(`scrapeando url: ${carrera.url}`)
                    await page.goto(carrera.url, {waitUntil: 'load', timeout: 90000})
                    let script = await page.evaluate(() => {
                        let tablas = document.getElementsByTagName('table')
                        let info = '-'
                        let requisitos = '-'
                        if (tablas[0]) { // es tabla de info
                            info = tablas[0].innerText
                        }
                        if (tablas[1]) { // es tabla de requisitos
                            requisitos = tablas[1].innerText
                        }
                        const xpath = "//a[contains(text(),'DESCARGA ')]"
                        const matchingElement = document.evaluate(xpath, document, null,
                             XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                        let data = {
                            url: document.URL,
                            descripcion: document.querySelectorAll('.col-lg-5')[1].innerText,
                            info: info,
                            requisitos: requisitos,
                            url_malla: matchingElement.getAttribute('href')
                        }
                        return data
                    })
                    results.push(script)
                }
            }

            browser.close()
            return resolve(results)
        } catch (e) {
            return reject(e)
        }
    }).catch((err) => console.error(err))
}

function run() {
    obtenerCarreras().then(facultades => {
        console.log('escribiendo urls a sistema')
        escribirJSON(dataFolder + '/carreras/carreras_urls.json', facultades)
        console.log('las urls fueron almacenadas')
        obtenerInfo(facultades).then(info => {
            console.log('escribiendo datos a sistema')
            escribirJSON(dataFolder + '/carreras/carreras_info.json', info)
            console.log('los datos fueron almacenados')
        })
    })
}

run()