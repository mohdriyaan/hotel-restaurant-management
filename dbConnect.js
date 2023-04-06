import mongoose from "mongoose";
import config from "config"

const connect = async()=>{
    try {
        await mongoose.connect(`${config.get("DB_URI")}`)
        console.log("MongoDB has been connected successfully")
    } catch (error) {
        console.log(error)
    }
}

connect()
