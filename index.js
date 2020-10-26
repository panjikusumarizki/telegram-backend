const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const bodyParser = require('body-parser')
const { PORT } = require('./src/helpers/env')
const cors = require('cors')

const userRouter = require('./src/routers/users_routers')
const userModel = require('./src/models/users_models')
const db = require('./src/configs/db')

io.on('connection', (socket) => {
    console.log('user connect')
    
    socket.on('get-all-users', () => {
        userModel.getAll().then((result) => {
            io.emit('list-users', result)
        }).catch((err) => {
            console.log(err)
        })
    })

    socket.on('delete-message', (data) => {
        userModel.deleteMsg(data)
    })

    socket.on('join-room', (payload) => {
        socket.join(payload)
    })

    socket.on('make-private-room', (payload) => {
        socket.join(payload)
    })

    socket.on('send-message', (payload) => {
        // console.log(payload)
        const room = payload.receiver

        db.query(`INSERT INTO message (sender, receiver, message) VALUES ('${payload.sender}','${payload.receiver}','${payload.message}')`, (err, result) => {
            if (err) {
                console.log(err)
            } else {
                io.to(room).emit('private-messages', {
                    sender: payload.sender,
                    receiver: room,
                    message: payload.message
                })
            }
        })
    })


    socket.on('get-history-message', (payload) => {
        db.query(`SELECT * FROM message WHERE (sender='${payload.sender}'
        AND receiver='${payload.receiver}') OR (sender='${payload.receiver}' AND receiver='${payload.sender}')`, (err, result) => {
            if (err) {
                console.log(err.message)
            } else {
                io.to(payload.sender).emit('historyMessage', result)
            }
        })
    })

    socket.on('disconnect', () => {
        console.log('user disconnect')
    })
})

const path = require('path')
const ejs = require('ejs')

app.set('views', path.join(__dirname, 'src/views'))
app.set('view engine', 'ejs')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('src/uploads'))

app.use('/users', userRouter)

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})