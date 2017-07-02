import socketio from "socket.io"
import session from "./session"
import * as UserStorage from "../app/storage/user"

let io = null

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
            if(!UserStorage.isConnect(req_session.name)){
                UserStorage.addUserOnline(socket)
                socket.broadcast.emit("hasConnect", { name: req_session.name, socketId: socket.id })
            }else{
                UserStorage.updateUser(socket)
            }
            socket.on("message", (data) => {
                const user = UserStorage.findUser(data.name)
                const message = {
                    name: req_session.name,
                    message: data.message
                }
                socket.broadcast.to(user.socketId).emit("new-message", message)
            })

            socket.on("getUserOnline", (data) => {
                const userOnline = UserStorage.getUserOnline(req_session.name)
                socket.emit("receiveUser", userOnline)
            })
            
            socket.on("disconnect", () => {
                setTimeout(() => {
                    if(UserStorage.removeUserOnline(socket)){
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
    next()
}

export { create, middleware }