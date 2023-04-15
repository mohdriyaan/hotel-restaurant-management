import express from "express"
import adminModel from "../../models/admin/index.js"
import { adminRegisterValidation,adminLoginValidation,errorMiddleware } from "../../validator/chef/index.js"
import bcrypt from "bcrypt" 
import randomString from "../../utils/randomString.js"
import jwt from "jsonwebtoken"
import config from "config"
import sendEmail from "../../utils/sendEmail.js"
import sendSMS from "../../utils/sendSMS.js"

const router = express.Router()

router.post("/register",
    adminRegisterValidation(),
    errorMiddleware,
    async(req,res)=>{
    try {
        // Destructuring to get the specific requested data in the body
        let {fullName,email,phone,address,password}=req.body
        
        // Checking if the user is already registered or Not
        let emailinDB = await adminModel.findOne({email})
        if(emailinDB){
            console.error("User is Already Registered.Verify it Again.")
            return res.status(401).json({mesage:"User Already Registered.Verify it Again."})
        }

        // Password Hashing
        let clientData = await adminModel(req.body)
        clientData.password = await bcrypt.hash(password,10)

        // Random String
        clientData.adminVerifiedString.phone = randomString(8)
        clientData.adminVerifiedString.email = randomString(8)
        
        // JWT Sign
        let key = config.get("JWT_KEY")
        
        let phoneToken = jwt.sign(
            {token:clientData.adminVerifiedString.phone},
            key,
            {expiresIn:"1h"}
        )
        
        let emailToken = jwt.sign(
            {token:clientData.adminVerifiedString.email},
            key,
            {expiresIn:'1h'}
            // 10m 30m 1h  4h   1d
        )
        
        // Send Email
        await sendEmail({
            to: email,
            subject: "Admin Account Verification - Riyaan Solutions",
            html: `Hi ${fullName} <br/>
              Thank you for Signing Up. Please <a href='${config.get(
              "URL"
              )}/api/chef/email/verify/${emailToken}'>Click Here </a>
              to verify your Email Address. <br/><br/>
              Thank you <br/>
              <b>Team Riyaan Solutions.</b>`,
        });

        
        // Send SMS    
        await sendSMS({
            body: `Hi ${fullName}, Please click the given link to verify your phone:- ${config.get("URL")}/api/chef/phone/verify/${phoneToken}`,
            phone:`+91`+`${phone}`
        });

        await clientData.save()
        res.status(201).json({message:"Admin Registered Successfully"}) 
        console.log("Admin Registered Successfully")   
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
        let clientData = await adminModel.findOne({
            "adminVerifiedString.phone": verify.token
        })

        if(clientData.adminVerified.phone){
            return res.status(401).json({message:"Admin Verified Already"})
        }

        clientData.adminVerified.phone = true
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
        let clientData = await adminModel.findOne({
            "adminVerifiedString.email": verify.token
        })

        if(clientData.adminVerified.email==true){
            return res.status(401).json({message:"Admin Verified Already"})
        }

        clientData.adminVerified.email = true
        await clientData.save()
        res.status(200).send("<h1>Email Verified Successfully</h1>")
    } catch (error) {
        console.error(error)
        res.status(501).json({message:"Internal Server Error"})
    }
})

router.post("/login",adminLoginValidation(),errorMiddleware,async(req,res)=>{
    try {
        let {email,password}=req.body
        let emailinDB = await usersModel.distinct("email")
        let verify
        if(emailinDB.includes(email)){
            let passwordinDB = await adminModel.findOne({email:email},{password:1})
            let adminVerification = await adminModel.findOne({email:email},{adminVerified:1})
            if(adminVerification.adminVerified.email==false){
                return res.status(401).json({message:"Email is Not Verified."})
            }else if(adminVerification.adminVerified.phone==false){
                return res.status(401).json({message:"Phone is Not Verified."})
            }else{
            verify = await bcrypt.compare(password,passwordinDB.password)
            }
        }
        if(!verify){
            return res.status(401).json({message:"Invalid Details. Please Register"})
        }

        res.status(200).json({message:"Login Admin Successfull."})
        console.log("Login Admin Successfull.")
        
    } catch (error) {
        console.error(error)
        res.status(500).json({message:"Internal Server Error"})
    }
})

router.post("/resend/email/:emailID",async(req,res)=>{
    try {
        let email = req.params.emailID
        let emailInDB = await adminModel.distinct("email")
        if(!emailInDB.includes(email)){
            return res.status(404).json({message:"Email Not Found IN DB."})
        }
        let fullName = await adminModel.findOne({email:email},{fullName:1})
        let adminVerification = await adminModel.findOne({email:email},{adminVerified:1})
        let adminVerificationString = await adminModel.findOne({email:email},{adminVerifiedString:1})
        if(adminVerification.adminVerified.email==false){
            let key = config.get("JWT_KEY")
        
            // let phoneToken = jwt.sign(
            //     {token:clientData.userVerifiedString.phone},
            //     key,
            //     {expiresIn:"1h"}
            // )
            let emailToken = jwt.sign(
                {token:adminVerificationString.adminVerifiedString.email},
                key,
                {expiresIn:'1h'}
                // 10m 30m 1h  4h   1d
            )
            
            await sendEmail({
                to: email,
                subject: "Admin Account Verification - Riyaan Solutions",
                html: `Hi ${fullName.fullName} <br/>
                  Thank you for Signing Up. Please <a href='${config.get(
                  "URL"
                  )}/api/chef/email/verify/${emailToken}'>Click Here </a>
                  to verify your Email Address. <br/><br/>
                  Thank you <br/>
                  <b>Team Riyaan Solutions.</b>`,
            });
    
        }else{
           return res.status(401).json({message:"Admin Verified Already"})
        }

        res.status(200).json({message:"Email has been Resent "})

    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
    }
})

router.post("/resend/phone/:phone",async(req,res)=>{
    try {
        let phone = req.params.phone
        let phoneInDB = await adminModel.distinct("phone")
        if(!phoneInDB.includes(phone)){
            return res.status(404).json({message:"Phone Not Found IN DB."})
        }
        let fullName = await adminModel.findOne({phone:phone},{fullName:1})
        let adminVerification = await adminModel.findOne({phone:phone},{adminVerified:1})
        let adminVerificationString = await adminModel.findOne({phone:phone},{adminVerifiedString:1})
        if(adminVerification.adminVerified.phone==false){
            let key = config.get("JWT_KEY")
            let phoneToken = jwt.sign(
                {token:adminVerificationString.adminVerifiedString.phone},
                key,
                {expiresIn:"1h"}
            )

            await sendSMS({
                body: `Hi ${fullName.fullName}, Please click the given link to verify your phone:- ${config.get("URL")}/api/chef/phone/verify/${phoneToken}`,
                phone:`+91`+`${phone}`
            });
        }else{
            return res.status(401).json({message:"Admin Verified Already"})
        }
        res.status(200).json({message:"SMS Has Been Resent"})

    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
    }
})


export default router
