import express from "express"
import usersModel from "../../models/users/index.js"
import { usersRegisterValidation,errorValidator } from "../../validator/users/index.js"

const router = express.Router()

router.use(express.json())

router.post("/register",
    usersRegisterValidation(),
    errorValidator,
    async(req,res)=>{
    try {
        let clientData=req.body
        let clientVerifyData = new usersModel(clientData)
        await clientVerifyData.save()
        res.status(201).json({message:"User Registered Successfully"}) 
        console.log("User Registered Successfully")   
    } catch (error) {
        console.log(error.errors)
        res.status(500).json({message:error.errors})
    }
})

router.post("/order/:id",async(req,res)=>{
    try {
        let _idData = req.params.id
        let idfromDB = await usersModel.distinct("_id")
        if(!idfromDB.includes(_idData)){
            res.status(404).json({message:"_id Not Found in the Database."})
            return
        }
        if(req.body.food==null||req.body.food==""){
            res.status(404).json({message:"Order has not been entered"})
            console.log("Order has not been entered")
            return
        }
        let insertData = await usersModel.updateOne({_id:`${_idData}`},{$push:{order:req.body.food}})
        console.log(insertData)
        res.status(201).json({message:"Added Order Successfully"}) 
        console.log("Added Order Successfully")   
    } catch (error) {
        console.log(error.errors)
        res.status(500).json({message:error.errors})
    }
})

router.get("/fetchall/:id",async(req,res)=>{
    try {
        let _idData = req.params.id
        let idfromDB = await usersModel.distinct("_id")
        if(!idfromDB.includes(_idData)){
            res.status(404).json({message:"_id Not Found in the Database."})
            return
        }
        
        let fetchData = await usersModel.findOne({_id:_idData},{order:1})
        res.status(200).send(fetchData) 
        console.log("Fetched Successfully")   
    } catch (error) {
        console.log(error.errors)
        res.status(500).json({message:error.errors})
    }
})

router.delete("/deleteall/:id",async(req,res)=>{
    try {
        let _idData = req.params.id
        let idfromDB = await usersModel.distinct("_id")
        if(!idfromDB.includes(_idData)){
            res.status(404).json({message:"_id Not Found in the Database."})
            return
        }

        let deleteData = await usersModel.updateOne({_id:_idData},{$set:{order:[]}})
        res.status(200).json({message:"Deleted Successfully"}) 
        console.log("Deleted Successfully")
    } catch (error) {
        console.log(error.errors)
        res.status(500).json({message:error.errors})        
    }
})

export default router
