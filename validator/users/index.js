import { body,validationResult } from "express-validator";

function usersRegisterValidation(){
    return[
        body("fullName","Name is required").isLength({min:2,max:50}).withMessage("Name should have length between 2 and 50").isString().withMessage("Name should have only characters"),
        body("email","Email is required").isEmail().withMessage("Email should be valid."),
        body("phone","Phone is required").isMobilePhone().withMessage("Phone should be valid").isLength({min:10}).withMessage("Phone Length should be 10"),
        body("address","Address is required").isLength({min:5,max:100}).withMessage("Address Length should be between 5 and 100").isString().withMessage("Address should be characters only"),
        body("password","Password is required ").isLength({min:6}).withMessage("Password Length should be equal or greater than 6"),
        body("confirmPassword","Confirm Pssword is Required").custom((value,{req})=>{
            if(value!==req.body.password){
                throw new Error("Confirm Password should match with the password.")
            }
            return true
        })

    ]
}

function userLoginValidation(){
    return[
        body("email","Email is Required").isEmail().withMessage("Email should be valid."),
        body("password","Password is Required").isLength({min:6}).withMessage("Password Length should greater or equal to 6")
    ]
}

function createOrderValidator(){
    return[
        body("food","Order is required").isLength({min:3,max:25}).withMessage("Order Length should be between 3 and 25.").isString().withMessage("Order should be characters only")
    ]
}

function errorValidator(req,res,next){
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.errors})
    }
    return next()
}

export {usersRegisterValidation,userLoginValidation,createOrderValidator,errorValidator}

