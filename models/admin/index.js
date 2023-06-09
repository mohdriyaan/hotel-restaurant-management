import mongoose from "mongoose";
import idGenerate from "../../utils/id.js";


const adminSchema = new mongoose.Schema({
  _id:{
    type:String,
    required:true,
    default:()=>idGenerate(10).toString()
  },
  fullName: {
    type: String,
    required: true
  },
  age:{
    type:Number,
    required:true
  },
  experience:{
    type:Number,
    required:true
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
  adminVerified:{
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
  adminVerifiedString:{
    email:{
      required:true,
      type:String,
      default:null
    },
    phone:{
      required:true,
      type:String,
      default:null
    }
  },
  createdAt:{
    type:Date,
    required:true,
    default:Date.now()
  }
});

const adminModel = new mongoose.model("CHEF",adminSchema,"chef")

export default adminModel