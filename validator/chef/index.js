import { body,validationResult } from "express-validator";

function adminRegisterValidation(){
    return[
        body("fullName","Name is required").isString().withMessage("Name should be characters only").isLength({min:2,max:50}).withMessage("Name Length should be between 2 and 50 "),
        body("age","Age is required").isNumeric().withMessage("Age should be number only"),
        body("experience","Experience is required").isNumeric().withMessage("Experience should be number only"),
        body("email","Email is Required").isEmail().withMessage("Email is not valid"),
        body("phone","Phone is Required").isMobilePhone().withMessage("Phone is not valid "),
        body("address","Address is Required").isLength({min:3,max:50}).withMessage("Address Length should be between 3 and 50"),
        body("password","Password is Required").isLength({min:6}).withMessage("Password Length should be 6 or greater than 6"),
        body("confirmPassword","Confirm Password is Required").custom((value,{req})=>{
            if(value!==req.body.password){
                throw new Error("Confirm Password Should Match With Password")
            }
            return true
        })
    ]
}

function adminLoginValidation(){
    return[
        body("email","Email is Required").isEmail().withMessage("Email should be valid."),
        body("password","Password is Required").isLength({min:6}).withMessage("Password Length should greater or equal to 6")
    ]
}

function errorMiddleware(req,res,next){
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.errors})
    }
    return next()
}

export {adminRegisterValidation,adminLoginValidation,errorMiddleware}    
