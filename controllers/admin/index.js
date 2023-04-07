import express from "express"
import adminModel from "../../models/admin/index.js"
// import idGenerate from "../../utils/id.js"


const router = express.Router()

// router.use(express.json())

router.post("/register",async(req,res)=>{
    try {
        // let _id=idGenerate(10)
        let clientData=req.body
        // console.log(clientData,"clientData")
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
