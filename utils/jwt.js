// import jwt from "jsonwebtoken"
// import config from "config"
// import usersModel from "../models/users/index.js"
// import randomString from "./randomString.js"

// let key = config.get("JWT_KEY")

// let clientData = await usersModel.find({})

// clientData.userVerifiedString.phone = randomString(8)
// clientData.userVerifiedString.email = randomString(10)

// let phoneToken = jwt.sign(
//     {token:clientData.userVerifiedString.phone},
//     key,
//     {expiresIn:"1h"}
// )

// let emailToken = jwt.sign(
//     {token:clientData.userVerifiedString.email},
//     key,
//     {expiresIn:'1h'}
//     // 10m 30m 1h  4h   1d
// )


// export {phoneToken,emailToken}


