import mongoose from "mongoose";
import idGenerate from "../../utils/id.js";

const usersSchema = new mongoose.Schema({
  _id:{
    type:String,
    required:true,
    default:()=>idGenerate(10).toString()
  },
  fullName: {
    type: String,
    required: true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  phone:{
    type:String,
    required:true,
    unique:true
  },
  address:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
  },
  userVerified:{
    email:{
      required:true,
      type:Boolean,
      default:false
    },
    phone:{
      required:true,
      type:Boolean,
      default:false
    }
  },
  userVerifiedString:{
    email:{
      type:String,
      required:true,
      default:null
    },
    phone:{
      type:String,
      default:null,
      required:true
    }
  },
  order:{
    type:Array,
    required:true,
  },
  createdAt:{
    type:Date,
    required:true,
    default:Date.now()
  }
 
});


const usersModel = new mongoose.model("USERS",usersSchema,"users")

export default usersModel