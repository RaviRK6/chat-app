const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filtre = require('bad-words')

const {generatemessage, generateLocationmessage} =require('./utils/messages')
const { addUser, removeUser, getUser, getuserInroom }= require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port= process.env.Port || 3000

const publicDirectorypath = path.join(__dirname, '../public')


app.use(express.static(publicDirectorypath))

// let count = 0
// let data = "welcome!"
//server (emit) -> client(recieve(on)) = countUpdated
//client (emit) -> server(recieve(on)) = increment


io.on('connection',(socket)=>{
    console.log('new websocket connection')
    // socket.emit('message','welcome!')
    // socket.emit('message',generatemessage('welcome!'))
    // socket.broadcast.emit('message', generatemessage('A New User Joined'))
  
    // socket.on('join',({ username , room }, callback)=>{
    //     const {error, user}= addUser({ id: socket.id , username , room })
    socket.on('join',(options, callback)=>{
        const {error, user}= addUser({ id: socket.id , ...options })

        if(error) {
            return callback(error)
        }

        //join only in server
        socket.join(user.room)

        //socket.emit for specific client
        //io.emit event to everyone connected client
        //socket.broadcast.emit to sent everyone connected except that user
        //io.to.emit everyone in sepcific room
        //socket.broadcast.to.emit sent everyone except that user sepecfic room
        socket.emit('message',generatemessage('Admin','welcome!'))
        socket.broadcast.to(user.room).emit('message', generatemessage('Admin',`${user.username} has Joined!`))
        io.to(user.room).emit('roomdata',{
            room: user.room,
            users: getuserInroom(user.room)
        })
        callback()
    })

    socket.on('sendmessage',(msg, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filtre()

        if(filter.isProfane(msg)){
            return callback('Profanity not allowed')
        }
        if(user){
            io.to(user.room).emit('message',generatemessage(user.username,msg))
            callback()
        }
    })

    socket.on('sendlocation',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationmessage',generateLocationmessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    // socket.emit('message','welcome!')

    // socket.emit('countUpdated',count)

    // socket.on('increment',()=>{
    //     count++
    //     // socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count)
    // })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message',generatemessage('Admin',`${user.username} has Left`))
            io.to(user.room).emit('roomdata',{
                room: user.room,
                users: getuserInroom(user.room)
            })
        }
    })
})

server.listen(port, ()=>{
    console.log('server is up on port' +port )
    console.log(`server is up on port ${port}!!`)
})