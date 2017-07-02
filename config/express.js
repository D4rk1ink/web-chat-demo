import http from "http"
import express from "express"
import * as socketio from "./socketio"
import session from "./session"
import bodyParser from "body-parser"
import * as UserStorage from "../app/storage/user"

export default () => {
    const app = express()
    const server = http.createServer(app)
    const io = socketio.create(server)
    const authMiddleware = (req, res, next) => {
        if(!req.session.isAuth){ 
            res.redirect("/")
            return false
        }else{
            next()
        }
    }
    app.use(session)
    app.use(socketio.middleware)
    app.use(bodyParser.urlencoded({ entended: false }))
    app.use(bodyParser.json())

    app.set("view engine", "ejs")
    app.set("views", "./app/view")
    
    app.get("/", (req, res) => {
        if(req.session){
            req.session.destroy()
        }
        res.render("index")
    })
    app.post("/auth", (req, res) => {
        const body = req.body
        if(body.name != "" && !UserStorage.isConnect(body.name)){
            req.session.isAuth = true
            req.session.name = body.name
            res.redirect("/chat")
        }else{
            res.redirect("/")
        }
    })
    app.get("/chat", authMiddleware, (req, res) => {
        const userOnline = UserStorage.getUserOnline(req.session.name)

        res.render("chat", { userOnline: userOnline })
    })
    
    app.use(express.static("public"))
    
    return server
}