import http from "http"
import express from "express"
import socketio from "./socketio"
import session from "./session"
import bodyParser from "body-parser"

export default () => {
    const app = express()
    const server = http.createServer(app)
    const io = socketio.create(server)

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
        if(body.name != ""){
            req.session.isAuth = true
            req.session.name = body.name
            res.redirect("/chat")
            //res.json({ status: true })
        }else{
            res.redirect("/")
            //res.json({ status: false })
        }
    })
    app.get("/chat", (req, res) => {
        if(!req.session.isAuth){ 
            res.redirect("/")
            return false
        }
        const userOnline = req.userOnline.filter((user) => {
            return user.name != req.session.name
        })

        res.render("chat", { userOnline: userOnline })
    })
    
    app.use(express.static("public"))
    
    return server
}