const puppeteer = require('puppeteer')
const FileSystem = require('fs')
const config = require('../config')

function escribirJSON(filename, data) {
    FileSystem.writeFileSync(filename, JSON.stringify(data))
}

function obtenerDatos() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()

            await page.goto("https://investigacion.ufro.cl/calendario-de-apoyos-diufro/", {waitUntil: 'load'})
            let script = await page.evaluate(() => {

                let data = []

                let fortalecimiento = document.querySelector('[data-id="1e38814"]')
                let estados = fortalecimiento.querySelectorAll('.elementor-section.elementor-inner-section.elementor-element.elementor-section-full_width.elementor-section-height-default.elementor-section-height-default')
                let titulos = fortalecimiento.querySelectorAll('.elementor-section.elementor-inner-section.elementor-element.elementor-reverse-mobile.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default')
                let apoyos = []
                for (let i = 0; i < estados.length; i++) {
                    let apoyo = {
                        estado: estados[i].querySelector('.elementor-button-text').textContent,
                        titulo: titulos[i].querySelector('a').textContent,
                        url: titulos[i].querySelector('a').getAttribute('href'),
                    }
                    apoyos.push(apoyo)
                }
                let fortalecimiento_data = {
                    tipo_apoyo: fortalecimiento.querySelectorAll('.elementor-element.elementor-widget.elementor-widget-tp-adv-text-block')[1].querySelector('p').textContent,
                    descripcion: fortalecimiento.querySelectorAll('.elementor-element.elementor-widget.elementor-widget-tp-adv-text-block')[2].querySelector('p').textContent,
                    apoyos: apoyos
                }
                data.push(fortalecimiento_data)

                let nuevos = document.querySelector('[data-id="afd5d65"]')
                estados = nuevos.querySelectorAll('.elementor-section.elementor-inner-section.elementor-element.elementor-section-full_width.elementor-section-height-default.elementor-section-height-default')
                titulos = nuevos.querySelectorAll('.elementor-section.elementor-inner-section.elementor-element.elementor-reverse-mobile.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default')
                apoyos = []
                for (let i = 0; i < estados.length; i++) {
                    let apoyo = {
                        estado: estados[i].querySelector('.elementor-button-text').textContent,
                        titulo: titulos[i].querySelector('a').textContent,
                        url: titulos[i].querySelector('a').getAttribute('href'),
                    }
                    apoyos.push(apoyo)
                }
                let nuevos_data = {
                    tipo_apoyo: nuevos.querySelectorAll('.elementor-element.elementor-widget.elementor-widget-tp-adv-text-block')[1].querySelector('p').textContent,
                    descripcion: nuevos.querySelectorAll('.elementor-element.elementor-widget.elementor-widget-tp-adv-text-block')[2].querySelector('p').textContent,
                    apoyos: apoyos
                }
                data.push(nuevos_data)


                let formativa = document.querySelector('[data-id="1675fa5"]')
                estados = formativa.querySelectorAll('.elementor-section.elementor-inner-section.elementor-element.elementor-section-full_width.elementor-section-height-default.elementor-section-height-default')
                titulos = formativa.querySelectorAll('.elementor-section.elementor-inner-section.elementor-element.elementor-reverse-mobile.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default')
                apoyos = []
                for (let i = 0; i < estados.length; i++) {
                    let apoyo = {
                        estado: estados[i].querySelector('.elementor-button-text').textContent,
                        titulo: titulos[i].querySelector('a').textContent,
                        url: titulos[i].querySelector('a').getAttribute('href'),
                    }
                    apoyos.push(apoyo)
                }
                let formativa_data = {
                    tipo_apoyo: formativa.querySelectorAll('.elementor-element.elementor-widget.elementor-widget-tp-adv-text-block')[1].querySelector('.text-content-block').textContent,
                    descripcion: formativa.querySelectorAll('.elementor-element.elementor-widget.elementor-widget-tp-adv-text-block')[2].querySelector('.text-content-block').textContent,
                    apoyos: apoyos
                }
                data.push(formativa_data)

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
        escribirJSON(config.investigacion_data_folder + '/apoyos_urls.json', datos)
    })
}

run()