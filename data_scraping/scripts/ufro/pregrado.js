const puppeteer = require('puppeteer')
const FileSystem = require('fs')
const config = require('../config')

function sleep(ms) {    
    return new Promise(resolve => setTimeout(resolve, ms))
}

function escribirJSON(filename, data) {
    FileSystem.writeFileSync(filename, JSON.stringify(data))
}

function obtenerUrls () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()

            await page.goto('https://pregrado.ufro.cl/index.php/noticias')

            await Promise.all([
                page.waitForNavigation(),
                // Del dropdown 'Cantidad a mostrar' se selecciona la opción 'Todos'
                // De esta manera se obtiene la página con una tabla 
                // que incluye todas las noticias publicadas hasta ahora
                await page.select('#limit', '0') 
            ])

            let script = await page.evaluate(() => {
                let noticias = document.querySelectorAll('.list-title')
                let data = []
                noticias.forEach(noticia => {
                    data.push({
                        titulo: noticia.innerText,
                        url: 'https://pregrado.ufro.cl' + noticia.querySelector('a').getAttribute('href')
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

function obtenerNoticias(noticias) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()

            let results = []

            for (let noticia of noticias) {
                console.log(`scrapeando url [${results.length + 1}/${noticias.length}]: ${noticia.url}`)
                await page.goto(noticia.url, {waitUntil: 'load', timeout: 90000})
                let script = await page.evaluate(() => {
                    let data = {
                        url: document.URL,
                        titulo: document.querySelector('[itemprop="headline"]').innerText,
                        cuerpo: document.querySelector('[itemprop="articleBody"]').innerText
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
    obtenerUrls().then(urls => {
        console.log('escribiendo urls a sistema')
        escribirJSON(config.ufro_data_folder + '/noticias/pregrado_urls.json', urls)
        console.log('las urls fueron almacenadas')
        obtenerNoticias(urls).then(noticias => {
            console.log('escribiendo datos a sistema')
            escribirJSON(config.ufro_data_folder + '/noticias/pregrado_noticias.json', noticias)
            console.log('los datos fueron almacenados')
        })
    })
}

run()