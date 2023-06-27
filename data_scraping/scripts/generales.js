const puppeteer = require('puppeteer')
const promises = require('fs/promises')
const FileSystem = require('fs')

const dataFolder = 'data'

function appendJSON(filename, data) {
    FileSystem.appendFileSync(filename, JSON.stringify(data)  + ",")
}

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

            await page.goto('https://www.ufro.cl/index.php/noticias/12-destacadas', {waitUntil: 'load', timeout: 0})

            await Promise.all([
                page.waitForNavigation(),
                // Del dropdown 'Cantidad a mostrar' se selecciona la opción 'Todos', o '0'
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
                        url: 'https://www.ufro.cl' + noticia.querySelector('a').getAttribute('href')
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

            for (let i = 5803; i < noticias.length; i++) {
                let id = i + 1
                console.log(`scrapeando url [${id}/${noticias.length}]: ${noticias[i].url}`)
                await page.goto(noticias[i].url, {waitUntil: 'load', timeout: 0})
                let script = await page.evaluate(id => {
                    let cuerpo = ''
                    if (document.querySelector('.tnoticia')) {
                        cuerpo = document.querySelector('.tnoticia').innerText
                    } else {
                        cuerpo = document.querySelector('.news-container').innerText
                    }
                    let data = {
                        id: id,
                        url: document.URL,
                        titulo: document.querySelector('[itemprop="name"]').innerText,
                        fecha_publicacion: document.getElementsByTagName('time')[0].getAttribute('datetime'),
                        cuerpo: cuerpo
                    }
                    return data
                }, id)
                appendJSON('./generales/noticias_generales_incomplete', script)
                results.push(script)
            }
            
            browser.close()
            return resolve(results)
        } catch (e) {
            return reject(e)
        }
    })
}

function run() {
    obtenerUrls().then(urls => {
        console.log('escribiendo urls a sistema')
        escribirJSON(dataFolder + '/generales/generales_urls.json', urls)
        console.log('las urls fueron almacenadas')
        obtenerNoticias(urls).then(noticias => {
            console.log('escribiendo datos a sistema')
            escribirJSON(dataFolder + '/generales/generales_noticias.json', noticias)
            console.log('los datos fueron almacenados')
        })
    }).catch(console.error)
}

run()