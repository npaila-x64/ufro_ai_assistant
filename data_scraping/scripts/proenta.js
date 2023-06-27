const puppeteer = require('puppeteer')
const FileSystem = require('fs')

const dataFolder = 'data'

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

            await page.goto('https://proenta2.ufro.cl/destacados/')

            let script = await page.evaluate(() => {
                let noticias = document.querySelectorAll('.mason-item')
                let data = []
                noticias.forEach(noticia => {
                    data.push({
                        titulo: noticia.querySelector('.mega-post-title').innerText,
                        fecha_publicacion: noticia.querySelector('.mega-post-date').innerText,
                        url: noticia.querySelector('.mega-post-title').querySelector('a').getAttribute('href')
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
                        titulo: document.querySelector('.post-title').innerText,
                        cuerpo: document.querySelector('.post-content').innerText
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
        escribirJSON(dataFolder + '/proenta/proenta_urls.json', urls)
        console.log('las urls fueron almacenadas')
        obtenerNoticias(urls).then(noticias => {
            console.log('escribiendo datos a sistema')
            escribirJSON(dataFolder + '/proenta/proenta_noticias.json', noticias)
            console.log('los datos fueron almacenados')
        })
    })
}

run()