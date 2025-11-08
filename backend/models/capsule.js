const mongoose=require('mongoose');
const capsuleSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    title:{
        type:String,
        required:true,
    },
    message:{
        type:String,
    },
    media:{
        type:String,
    },
    unlockAt:{
        type:Date,
        required:true,
    },
    isUnlocked:{
        type:Boolean,
        default:false,
    },
},{timestamps:true});

module.exports=mongoose.model('Capsule',capsuleSchema);