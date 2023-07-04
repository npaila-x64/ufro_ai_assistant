const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)

const axios = require('axios')

// Set static directory with the files to be served
app.use(express.static(__dirname + '/public'))

// On root directory serve the main webpage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

const PORT = 20000

server.listen(PORT, () => log('listening on *:' + PORT))

io.on('connection', socket => {
    let codename = getRandomName()
    log(`User connected, ID ${socket.id}, codename '${codename}'`)

    socket.on('message', message => {
        log(`Message received from ${codename}: ${message}`)
        io.to(socket.id).emit('message_success', 'OK')
        // TODO must log id, message, response, and response time delay

        let dataToSend = {
            message: message
        }

        log('Sending message to AI') // TODO add unique ID to each message
        
        axios.post('http://127.0.0.1:1234/ai_output', dataToSend)
        .then(response => {
            log('Received message from AI. Sending to user')
            io.to(socket.id).emit('response', response.data)
        })
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            socket.disconnect() // The connection is closed server-side
        })
    })

    socket.on('disconnect', () => {
        log(`${codename} disconnected`);
    })
})

// Logs to console with timestamps, replaces console.log()
const log = content => {
    const date = new Date()
    console.log(`[${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB')}] ${content}`)
}

const names = ["María", "Juan", "José", "Ana", "Carlos", "Cristina", "David", "Marta", "Francisco", "Isabel", "Luis", "Antonio", "Patricia", "Manuel", "Angela", "Rafael", "Gabriela", "Fernando", "Alejandra", "Roberto"];
function getRandomName() {
    let index = Math.floor(Math.random() * names.length)
    let randonNumber = Math.floor(Math.random() * 100)
    return names[index] + randonNumber
}