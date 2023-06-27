const puppeteer = require('puppeteer')
const FileSystem = require('fs')

const dataFolder = 'data'

function escribirJSON(filename, data) {
    FileSystem.writeFileSync(filename, JSON.stringify(data))
}

function obtenerUrls () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()

            await page.goto('https://www.ufro.cl/index.php/mision')

            let script = await page.evaluate(() => {
                let menu = document.querySelector('.menu')
                let a = menu.querySelectorAll('a')
                let data = []
                a.forEach(el => {
                    let url = el.getAttribute('href')
                    data.push({
                        titulo: el.innerText,
                        url: (!url.includes('ufro.cl')? 'https://www.ufro.cl' : '') + url
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

function obtenerInfo (categorias) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()

            let results = []

            for (let categoria of categorias) {
                if (categoria.url.includes('www.ufro.cl/index.php')) {

                    console.log(`scrapeando url: ${categoria.url}`)
                    await page.goto(categoria.url)
                    let script = await page.evaluate(() => {
                        let element = ''
                        if (document.URL.includes('normas-corporativas')) {
                            element = document.querySelector('.docman_list_layout')
                        } else {
                            element = document.querySelector('.item-page')
                        }
                        let data = {
                            url: document.URL,
                            info: element.innerText
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
    obtenerUrls().then(categorias => {
        console.log('escribiendo urls a sistema')
        escribirJSON(dataFolder + '/mision/mision_urls.json', categorias)
        console.log('las urls fueron almacenadas')
        obtenerInfo(categorias).then(info => {
            console.log('escribiendo datos a sistema')
            escribirJSON(dataFolder + '/mision/mision_info.json', info)
            console.log('los datos fueron almacenados')
        })
    })
}

run()