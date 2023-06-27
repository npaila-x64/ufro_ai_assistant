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

            await page.goto('https://www.ufro.cl/index.php/facultades-2')

            let script = await page.evaluate(() => {
                let facultades = document.querySelectorAll('.facultades')
                let data = []
                facultades.forEach(facultad => {
                    data.push({
                        titulo_facultad: facultad.querySelector('p').innerText,
                        url_info_facultad: 'https://www.ufro.cl' + facultad.querySelectorAll('a')[0].getAttribute('href'),
                        sitio_web: facultad.querySelectorAll('a')[1].getAttribute('href'),
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
                console.log(`scrapeando url: ${facultad.url_info_facultad}`)
                await page.goto(facultad.url_info_facultad, {waitUntil: 'load', timeout: 90000})
                let script = await page.evaluate(() => {
                    let data = {
                        url: document.URL,
                        titulo_facultad: document.querySelector('.page-header').innerText,
                        info: document.querySelector('[itemprop="articleBody"]').innerText,
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
    obtenerCarreras().then(facultades => {
        console.log('escribiendo urls a sistema')
        escribirJSON(dataFolder + '/facultades/facultades_urls.json', facultades)
        console.log('las facultades fueron almacenadas')
        obtenerInfo(facultades).then(info => {
            console.log('escribiendo datos a sistema')
            escribirJSON(dataFolder + '/facultades/facultades_info.json', info)
            console.log('los datos fueron almacenados')
        })
    })
}

run()