import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const numericNanoid = customAlphabet('0123456789', 3);

const ThirdPartySchema = new mongoose.Schema(
    {
        id:{
            type:String,
            required:true,
            unique:true,
            default: ()=> `TP-${numericNanoid}`
        },
        name: {
            type:String,
            required:true,
        },
        type: {
            type:String,
            required:true,
        },
        role: {
            type:String,
            required:true,
        },
        url: {
            type:String,
            required:true,
        },
        industry:{
            type:String,
            required:true
        },
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            required: true, 
            ref: "User"
        },
        projectId: { 
            type: String,
            required: true
        },
    },{ timestamps:true }
);

export default mongoose.model('ThirdParty',ThirdPartySchema);