const fs = require('fs')

function escribirTXT(filename, data) {
    fs.writeFileSync(filename, data)
}

let rawdata = ""
let array = []
let output = ""


// rawdata = fs.readFileSync('proyectos.json')
// array = JSON.parse(rawdata)
// output = "La siguiente información corresponde a la oferta de convocatorias y concursos a proyectos de investigación que la Dirección de Investigación de la Universidad de La Frontera dispone a las y los investigadores tanto de la misma universidad como de otras universidades de Chile y el mundo.\n\n"
// for (let proyecto of array) {
//     output += "url: " + proyecto.url + "\n"
//     output += proyecto.titulo + "\n"
//     output += proyecto.descripcion
//     for (let detalle in proyecto.detalles) {
//         output += detalle + ": " + proyecto.detalles[detalle] + "\n"
//     }
//     output += "\n"
// }
// escribirTXT('oferta_de_proyectos.txt', output)



// rawdata = fs.readFileSync('concursos.json')
// array = JSON.parse(rawdata)
// output = "La siguiente información corresponde a la oferta de concursos de investigación que la Dirección de Investigación de la Universidad de La Frontera dispone a las y los investigadores tanto de la misma universidad como de otras universidades de Chile y el mundo.\n\n"
// for (let concurso of array) {
//     output += "url: " + concurso.url + "\n"
//     output += concurso.titulo + "\n"
//     output += concurso.descripcion
//     for (let detalle in concurso.detalles) {
//         output += detalle + ": " + concurso.detalles[detalle] + "\n"
//     }
//     output += "\n"
// }
// escribirTXT('concursos.txt', output)


// rawdata = fs.readFileSync('apoyos.json')
// array = JSON.parse(rawdata)
// output = "La siguiente información corresponde a la oferta de apoyos a proyectos de investigación que la Dirección de Investigación de la Universidad de La Frontera dispone a las y los investigadores tanto de la misma universidad como de otras universidades de Chile y el mundo.\n\n"
// for (let apoyo of array) {
//     output += "url: " + apoyo.url + "\n"
//     output += apoyo.titulo + "\n"
//     output += apoyo.descripcion
//     for (let detalle in apoyo.detalles) {
//         output += detalle + ": " + apoyo.detalles[detalle] + "\n"
//     }
//     output += "\n"
// }
// escribirTXT('apoyos.txt', output)


rawdata = fs.readFileSync('equipo.json')
array = JSON.parse(rawdata)
output = "La siguiente información corresponde al equipo de profesionales que componen la Dirección de Investigación de la Universidad de La Frontera\n\n"
for (let profesional of array) {
    output += "nombre: " + profesional.nombre + "\n"
    output += "rol: " + profesional.rol + "\n"
    output += "profesion: " + profesional.profesion + "\n"
    output += "telefono: " + profesional.telefono + "\n"
    output += "correo: " + profesional.correo + "\n"
    output += "\n"
}
escribirTXT('equipo.txt', output)
