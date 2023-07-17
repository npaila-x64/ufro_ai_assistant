const puppeteer = require('puppeteer')
const FileSystem = require('fs')
const config = require('../config')

function escribirCSV(filename, data) {
    FileSystem.writeFileSync(filename, JSON.stringify(data))
}

function obtenerDatos() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: 'new'})
            const page = await browser.newPage()

            await page.goto('https://extranet.ufro.cl/investigacion/ver_cv_investigacion.php')
            let getOptionValues = () => {
                let values = []
                let options = document.querySelector('#cod_unidad').querySelectorAll('option:not([value="0"])')
                for (let option of options) {
                    values.push(option.getAttribute('value'))
                }
                return values
            }

            let optionValues = await page.evaluate(getOptionValues)

            let unidades = []

            for (let option of optionValues) {
                await page.goto('https://extranet.ufro.cl/investigacion/ver_cv_investigacion.php')
                await page.select('#cod_unidad', option)

                await page.click('[value="BUSCAR"]')

                try {
                    await page.waitForSelector(".Tabla_lst", {timeout: 100000})
                    let dataScript = () => {
                        let data = []
                        const table = document.querySelector('.Tabla_lst')
                        const rows = table.querySelectorAll('tr')
                        for (let j = 1; j < rows.length; j++) {
                            let r = {}
                            const investigador = rows[j].querySelectorAll('td')[1].textContent
                            const unidad = rows[j].querySelectorAll('td')[2].textContent
                            r["investigador"] = investigador
                            r["unidad"] = unidad
                            data.push(r)
                        }
                        return data
                    }

                    let investigadores = await page.evaluate(dataScript) 

                    let unidad = {
                        unidad: await page.evaluate(option => {
                                    return document.querySelector("[value='" + option + "']").textContent
                                }, option),
                        investigadores: investigadores
                    }

                    unidades.push(unidad)

                    } catch (e) {
                        if (e instanceof puppeteer.errors.TimeoutError) {
                            console.log('TIMEOUT')
                        } else {
                            console.log(e)
                        }
                }

            }

            browser.close()
            return resolve(unidades)
        } catch (e) {
            return reject(e)
        }
    }).catch((err) => console.error(err))
}

function run() {
    obtenerDatos().then(datos => {
        console.log('escribiendo datos a sistema')
        escribirCSV(config.investigacion_data_folder + '/investigadores.json', datos)
    }).catch("error")
}

run()