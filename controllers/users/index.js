import express from "express"
import usersModel from "../../models/users/index.js"
import { usersRegisterValidation,userLoginValidation,createOrderValidator,errorValidator } from "../../validator/users/index.js"
import bcrypt from "bcrypt" 
import randomString from "../../utils/randomString.js"
import jwt from "jsonwebtoken"
import config from "config"
import sendEmail from "../../utils/sendEmail.js"
import sendSMS from "../../utils/sendSMS.js"


const router = express.Router()

router.use(express.json())

router.post("/register",
    usersRegisterValidation(),
    errorValidator,
    async(req,res)=>{
    try {
        // Destructuring to get the specific requested data in the body
        let {fullName,email,phone,address,password}=req.body
        
        // Checking if the user is already registered or Not
        let emailinDB = await usersModel.findOne({email})
        if(emailinDB){
            console.error("User is Already Registered.Verify it Again.")
            return res.status(401).json({mesage:"User Already Registered.Verify it Again."})
        }

        // Password Hashing
        let clientData = await usersModel(req.body)
        clientData.password = await bcrypt.hash(password,10)

        // Random String
        clientData.userVerifiedString.phone = randomString(8)
        clientData.userVerifiedString.email = randomString(8)
        
        // JWT Sign
        let key = config.get("JWT_KEY")
        
        
        let phoneToken = jwt.sign(
            {token:clientData.userVerifiedString.phone},
            key,
            {expiresIn:"1h"}
        )
        
        let emailToken = jwt.sign(
            {token:clientData.userVerifiedString.email},
            key,
            {expiresIn:'1h'}
            // 10m 30m 1h  4h   1d
        )
        
        // console.log("Email:=",emailToken)
        // console.log("Phone:=",phoneToken)

        // Testing
        //     console.log(
        //     `Hi ${fullName}, Please click the given link to verify your phone ${config.get(
        //       "URL"
        //     )}/api/users/phone/verify/${phoneToken}`
        //   );
        //   console.log(`Hi ${fullName} <br/>
        //         Thank you for Signing Up. Please <a href='${config.get(
        //           "URL"
        //         )}/api/users/email/verify/${emailToken}'>Click Here </a>
        //         to verify your Email Address. <br/><br/>
        //         Thank you <br/>`)
        
        // Send Email
        await sendEmail({
            to: email,
            subject: "User Account Verification - Riyaan Solutions",
            html: `Hi ${fullName} <br/>
              Thank you for Signing Up. Please <a href='${config.get(
              "URL"
              )}/api/users/email/verify/${emailToken}'>Click Here </a>
              to verify your Email Address. <br/><br/>
              Thank you <br/>
              <b>Team Riyaan Solutions.</b>`,
        });

        
        // Send SMS    
        await sendSMS({
            body: `Hi ${fullName}, Please click the given link to verify your phone:- ${config.get("URL")}/api/users/phone/verify/${phoneToken}`,
            phone:`+91`+`${phone}`
        });

        await clientData.save()
        res.status(201).json({message:"User Registered Successfully"}) 
        console.log("User Registered Successfully")   
    } catch (error) {
        console.log(error.errors)
        res.status(501).json({message:error.errors})
    }
})

router.get("/phone/verify/:token",async(req,res)=>{
    try {
        let {token} = req.params
        let key = config.get("JWT_KEY")
        let verify = jwt.verify(token,key)
        if(!verify){
            return res.status(401).json({message:"Token Expired or Invalid URL"})
        }
        let clientData = await usersModel.findOne({
            "userVerifiedString.phone": verify.token
        })

        if(clientData.userVerified.phone){
            return res.status(401).json({message:"User Verified Already"})
        }

        clientData.userVerified.phone = true
        await clientData.save()
        res.status(200).send("<h1>Phone Verified Successfully</h1>")
    } catch (error) {
        console.error(error)
        res.status(501).json({message:"Internal Server Error"})
    }
})

router.get("/email/verify/:token",async(req,res)=>{
    try {
        let {token} = req.params
        let key = config.get("JWT_KEY")
        let verify = jwt.verify(token,key)
        if(!verify){
            return res.status(401).json({message:"Token Expired or Invalid URL"})
        }
        let clientData = await usersModel.findOne({
            "userVerifiedString.email": verify.token
        })

        if(clientData.userVerified.email==true){
            return res.status(401).json({message:"User Verified Already"})
        }

        clientData.userVerified.email = true
        await clientData.save()
        res.status(200).send("<h1>Email Verified Successfully</h1>")
    } catch (error) {
        console.error(error)
        res.status(501).json({message:"Internal Server Error"})
    }
})

router.post("/login",userLoginValidation(),errorValidator,async(req,res)=>{
    try {
        let {email,password}=req.body
        let emailinDB = await usersModel.distinct("email")
        let verify
        if(emailinDB.includes(email)){
            let passwordinDB = await usersModel.findOne({email:email},{password:1})
            let userVerification = await usersModel.findOne({email:email},{userVerified:1})
            if(userVerification.userVerified.email==false){
                return res.status(401).json({message:"Email is Not Verified."})
            }else if(userVerification.userVerified.phone==false){
                return res.status(401).json({message:"Phone is Not Verified."})
            }else{
            verify = await bcrypt.compare(password,passwordinDB.password)
            }
        }
        if(!verify){
            return res.status(401).json({message:"Invalid Details. Please Register"})
        }

        res.status(200).json({message:"Login User Successfull."})
        console.log("Login User Successfull.")
        
    } catch (error) {
        console.error(error)
        res.status(500).json({message:"Internal Server Error"})
    }
})

router.post("/resend/email/:emailID",async(req,res)=>{
    try {
        let email = req.params.emailID
        let emailInDB = await usersModel.distinct("email")
        if(!emailInDB.includes(email)){
            return res.status(404).json({message:"Email Not Found IN DB."})
        }
        let fullName = await usersModel.findOne({email:email},{fullName:1})
        let usersVerification = await usersModel.findOne({email:email},{userVerified:1})
        let userVerificationString = await usersModel.findOne({email:email},{userVerifiedString:1})
        if(usersVerification.userVerified.email==false){
            let key = config.get("JWT_KEY")
        
            // let phoneToken = jwt.sign(
            //     {token:clientData.userVerifiedString.phone},
            //     key,
            //     {expiresIn:"1h"}
            // )
            let emailToken = jwt.sign(
                {token:userVerificationString.userVerifiedString.email},
                key,
                {expiresIn:'1h'}
                // 10m 30m 1h  4h   1d
            )
            
            await sendEmail({
                to: email,
                subject: "User Account Verification - Riyaan Solutions",
                html: `Hi ${fullName.fullName} <br/>
                  Thank you for Signing Up. Please <a href='${config.get(
                  "URL"
                  )}/api/users/email/verify/${emailToken}'>Click Here </a>
                  to verify your Email Address. <br/><br/>
                  Thank you <br/>
                  <b>Team Riyaan Solutions.</b>`,
            });
    
        }else{
           return res.status(401).json({message:"User Verified Already"})
        }

        res.status(200).json({message:"Email has been Resent "})

    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
    }
})

router.post("/resend/phone/:phone",async(req,res)=>{
    try {
        let phone = req.params.phone
        let phoneInDB = await usersModel.distinct("phone")
        if(!phoneInDB.includes(phone)){
            return res.status(404).json({message:"Phone Not Found IN DB."})
        }
        let fullName = await usersModel.findOne({phone:phone},{fullName:1})
        let usersVerification = await usersModel.findOne({phone:phone},{userVerified:1})
        let userVerificationString = await usersModel.findOne({phone:phone},{userVerifiedString:1})
        if(usersVerification.userVerified.phone==false){
            let key = config.get("JWT_KEY")
            let phoneToken = jwt.sign(
                {token:userVerificationString.userVerifiedString.phone},
                key,
                {expiresIn:"1h"}
            )

            await sendSMS({
                body: `Hi ${fullName.fullName}, Please click the given link to verify your phone:- ${config.get("URL")}/api/users/phone/verify/${phoneToken}`,
                phone:`+91`+`${phone}`
            });
        }else{
            return res.status(401).json({message:"User Verified Already"})
        }
        res.status(200).json({message:"SMS Has Been Resent"})

    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
    }
})

router.post("/order/:id",createOrderValidator(),errorValidator,async(req,res)=>{
    try {
        let _idData = req.params.id
        let idfromDB = await usersModel.distinct("_id")
        if(!idfromDB.includes(_idData)){
            res.status(404).json({message:"_id Not Found in the Database."})
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
