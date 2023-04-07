import express from "express"
import adminModel from "../../models/admin/index.js"
import { adminRegisterValidation,errorMiddleware } from "../../validator/chef/index.js"


const router = express.Router()


router.post("/register",adminRegisterValidation(),errorMiddleware,async(req,res)=>{
    try {
        let clientData=req.body
        let clientVerifyData = new adminModel(clientData)
        await clientVerifyData.save()
        res.status(201).json({message:"Chef Registered Successfully"})
        console.log("Chef Registered Successfully")    
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error})
    }
})

export default router
