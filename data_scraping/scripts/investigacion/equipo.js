const puppeteer = require('puppeteer')
const fs = require('fs')
const config = require('../config')

function escribirJSON(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data))
}


function obtenerDatos() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()
            await page.goto('https://investigacion.ufro.cl/nuestro-equipo/')

            let script = await page.evaluate(() => {
                let profesionales = document.querySelectorAll('.elementor-element.texto.elementor-widget.elementor-widget-tp-adv-text-block')
                let telefonos = document.querySelectorAll('.elementor-widget-wrap .elementor-element.elementor-icon-list--layout-traditional')
                let data = []

                for (let i = 0; i < profesionales.length; i++) {
                    let nombre = profesionales[i].querySelector('strong').textContent.trim()
                    let rol = profesionales[i].querySelector('p').lastChild.textContent.trim()
                    let profesion = profesionales[i].querySelector('.text-content-block').querySelectorAll('p')[1].textContent.trim()
                    let telefono = telefonos[i].querySelector('.elementor-icon-list-text').textContent.trim()
                    let correo = telefonos[i].querySelector('.elementor-icon-list-item a .elementor-icon-list-text').textContent.trim()
                    data.push({
                        nombre: nombre,
                        rol: rol,
                        profesion: profesion,
                        telefono: telefono,
                        correo: correo
                    })
                }

                return data
            })

            let data = script
            
            browser.close()
            return resolve(data)
        } catch (e) {
            return reject(e)
        }
    }).catch((err) => console.error(err))
}

function run() {
    obtenerDatos().then(datos => {
        console.log('escribiendo datos a sistema')
        escribirJSON(config.investigacion_data_folder + '/equipo.json', datos)
    })
}

run()