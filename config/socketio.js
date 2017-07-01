import socketio from "socket.io"
import session from "./session"

let userOnline = []
let io = null

const addUserOnline = (socket) => {
    const sessionTemp = socket.request.session
    const user = { name: sessionTemp.name, socketId: socket.id, online: true }
    userOnline.push(user)
}

const updateUser = (socket) => {
    const sessionTemp = socket.request.session
    const indexUpdate = userOnline.findIndex((user) => {
        return user.name == sessionTemp.name
    })
    userOnline[indexUpdate].socketId = socket.id
}

const removeUserOnline = (socket) => {
    const sessionTemp = socket.request.session
    const indexRemove = userOnline.findIndex((user) => {
        return user.name == sessionTemp.name
    })
    if(indexRemove > -1 && userOnline[indexRemove].socketId == socket.id){
        userOnline.splice(indexRemove, 1)
        return true
    }else{
        return false
    }
}

const isFirstConnect = (name) => {
    return userOnline.every((user) => {
        return user.name != name
    })
}

const create = (server) => {
    io = socketio(server)
    io.use((socket, next) => {
        session(socket.request, socket.request.res, next)
    })

    io.on("connection", (socket) => {
        let req_session = socket.request.session
        if(!req_session.isAuth){ 
            return false
        }else{
            if(isFirstConnect(req_session.name)){
                addUserOnline(socket)
                socket.broadcast.emit("hasConnect", { name: req_session.name, socketId: socket.id })
            }else{
                updateUser(socket)
            }
            
            socket.on("disconnect", () => {
                setTimeout(() => {
                    if(removeUserOnline(socket)){
                        socket.broadcast.emit("hasDisconnect", { name: req_session.name, socketId: socket.id })
                    }
                }, 5000)    
            })
        }
    })
    
    return io
}

const middleware = (req, res, next) => {
    req.io = io
    req.userOnline = userOnline
    next()
}

export default {
    create: create,
    middleware: middleware
}