const bot = 'assets/bot.svg' 
const user = 'assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Prints dots in a sequental manner as it waits for a response
let loader = element => {
    element.textContent = ''

    loadInterval = setInterval(() => {
        element.textContent += '.'

        if (element.textContent === '....') {
            element.textContent = ''
        }
    }, 300)
}

// Mimics how ChatGPT displays its responses, one character at a time
let typeText = async (element, text) => {
    let index = 0

    while (index < text.length) {
        element.innerHTML += text.charAt(index)
        index++
        await sleep(20)
    }
}

// Each AI response gets an unique ID
let generateUniqueId = () => {
    const timestamp = Date.now()
    const randomNumber = Math.random()
    const hexadecimalString = randomNumber.toString(16)

    return `id-${timestamp}-${hexadecimalString}`
}

let chatStripe = (isAi, value, uniqueId) => {
    return (
        `
        <div class="wrapper ${isAi ? 'ai' : 'user'}">
            <div class="chat">
                <div class="profile">
                    <img 
                        src=${isAi ? bot : user}
                        alt=${isAi ? 'bot' : 'user'}
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
        `
    )
}

let setEnableForm = b => {
    if (b) {
        form.querySelector('textarea').removeAttribute('disabled')
        form.querySelector('button').removeAttribute('disabled')
    } else {
        form.querySelector('textarea').setAttribute('disabled', '')
        form.querySelector('button').setAttribute('disabled', '')
    }
}

const handleSubmit = async e => {
    e.preventDefault() // Prevents the page from loading
    const data = new FormData(form)

    chatContainer.innerHTML += chatStripe(false, data.get('prompt'), 0)

    form.reset()

    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, '', uniqueId)

    chatContainer.scrollTop = chatContainer.scrollHeight

    const messageDiv = document.getElementById(uniqueId)

    loader(messageDiv)

    // disables form until a response is received
    log('Locking form')
    setEnableForm(false)

    const socket = io();

    socket.on('response', async response => {
        log(`Received message from server: '${response.data}'`)

        clearInterval(loadInterval)
        messageDiv.innerHTML = ''

        log('Typing response')
        await typeText(messageDiv, response.data)

        // should focus the form at the end
        setEnableForm(true)
        form.querySelector('textarea').focus() 
        log('Form was unlocked')
    })

    log(`Message to be sent: '${data.get('prompt')}'`)
    socket.emit('message', data.get('prompt'))
    
    socket.on('message_success', event => log('Message was successfully sent. Waiting for response'))
    socket.on('disconnect', event => log('Connection was closed'))
    socket.on('connect_error', event => log(event))
    socket.on('error', event => log(event))
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keydown', e => {
    if (e.keyCode == 13) {
        handleSubmit(e)
        return // returns so a newline is ignored
    }
})

form.querySelector('textarea').focus()

// Logs to console with timestamps, replaces console.log()
const log = content => {
    const date = new Date()
    console.log(`[${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB')}] ${content}`)
}
