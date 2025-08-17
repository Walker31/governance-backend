import mongoose from "mongoose";
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet('0123456789',4);
const ControlSchema = new mongoose.Schema({
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    code: {
        type:String,
        required:true,
        default:() => `AI-${nanoid()}`
    },
    section: {
        type:String,
        required:true,
    },
    control: {
        type:String,
        required:true,
    },
    requirements: {
        type:String,
        required:true,
    },
    status: {
        type:String,
        required:true,
    },
    tickets: {
        type:String,
        required:true,
    },
},{timestamps:true,collection: 'Control Assessments'})

const Control = mongoose.model('ControlAssessment', ControlSchema);

export default Control;