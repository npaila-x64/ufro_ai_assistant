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

            await page.goto('https://dde.ufro.cl/category/noticias/')

            let script = await page.evaluate(() => {
                let noticias = document.querySelectorAll('.entry-title')
                let data = []
                noticias.forEach(noticia => {
                    data.push({
                        titulo: noticia.innerText,
                        url: noticia.querySelector('a').getAttribute('href')
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
                    let parrafos = document.querySelector('.noticias-p').getElementsByTagName('p')
                    let cuerpo = ''
                    for (let p of parrafos) {
                        cuerpo += p.innerText
                        cuerpo += '\n'
                    }
                    let data = {
                        url: document.URL,
                        titulo: document.getElementsByTagName('h1')[0].innerText,
                        cuerpo: cuerpo
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
        escribirJSON(dataFolder + '/dde/dde_urls.json', urls)
        console.log('las urls fueron almacenadas')
        obtenerNoticias(urls).then(noticias => {
            console.log('escribiendo datos a sistema')
            escribirJSON(dataFolder + '/dde/dde_noticias.json', noticias)
            console.log('los datos fueron almacenados')
        })
    })
}

run()