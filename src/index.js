const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage , generateLocationMessage} = require("../src/utils/messages")
const {addUser,removeUser,getUser,getUsersInRoom} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname,"../public")

app.use(express.static(publicDirPath))
// var count = 0; 
io.on("connection",(socket)=>{
    console.log("new connection")
    
    socket.on("join",({username,room}, callback)=>{
        const {error , user} = addUser({
            id:socket.id,
            username,
            room
        })
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        
        socket.emit("message" , generateMessage('Admin',"Welcome!"))
        socket.broadcast.to(user.room).emit("message", generateMessage('Admin',username+" has joined!"))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on("sendMessage" , (message , callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Profanity is not allowed")
        }
    
        io.to(user.room).emit("message",generateMessage(user.username,message))
        callback()
    })

    socket.on("disconnect",()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit("message",generateMessage(user.username,user.username+" has left!"))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

    socket.on("sendLocation",(lat,long,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username , `https://google.com/maps?q=${lat},${long}`))
        callback("Location Shared")
    })
})

server.listen(port , ()=>{
    console.log("App is up on server")
}) 