import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet('0123456789',4);
const ProjectSchema = new mongoose.Schema({
    projectId : {
        type:String,
        requried:true,
        index:true,
        unique:true,
        default: () => `P-${nanoid()}`
    },
    projectName : {
        type: String,
        required:true
    },
    workflow: {
        type: String,
        required:true
    },
    template: {
        type: String,
        required:true
    },
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    status: {
        type:String,
        required:true,
        default:'Opened',
        enum: ['Approved','Completed','Ongoing','Opened']
    },
}, {
    timestamps: true
});

const Project = mongoose.model('Project',ProjectSchema);

export default Project;