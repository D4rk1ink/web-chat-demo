import express from "./config/express"

const app = express()

app.listen(3000, () => {
    console.log("START SERVER...")
})