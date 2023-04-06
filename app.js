import express from "express"
import config from "config"
import adminAPI from "./controllers/admin/index.js"
import userAPI from "./controllers/users/index.js"

const PORT = config.get("PORT")

const app = express()

import "./dbConnect.js"

app.use(express.json())

app.get("/",(req,res)=>{
    res.status(200).send("<h1>Hotel Management</h1>")
})

app.use("/api/admin",adminAPI)
app.use("/api/users",userAPI)

app.use((req,res)=>{
    res.status(404).json({message:"Invalid Route"})
})

app.listen(PORT,()=>{
    console.log(`Server Listening At PORT ${PORT}`)
})
