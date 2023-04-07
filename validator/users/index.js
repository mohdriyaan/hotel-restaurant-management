import { body,validationResult } from "express-validator";

function usersRegisterValidation(){
    return[
        body("fullName","Name is required and the length should be between 2 and 50.").isString().isLength({min:2,max:50}),
        body("email","Email is required").isEmail(),
        body("phone","Phone is required").isMobilePhone(),
        body("address","Address is required and the length should be between 5 and 100").isLength({min:5,max:100}),
        body("password","Password is required and the minimum length should be 6.").isLength({min:6}),
        body("order","Order is Required ").isArray(),
        body("confirmPassword","Confirm Pssword is Required").custom((value,{req})=>{
            if(value!==req.body.password){
                throw new Error("Confirm Password should match with the password.")
            }
            return true
        })

    ]
}

function errorValidator(req,res,next){
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.errors})
    }
    return next()
}

export {usersRegisterValidation,errorValidator}
