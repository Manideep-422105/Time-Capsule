const express=require('express');
const router=express.Router();

const authRoutes=require('./authRoutes');
const capsuleRoutes=require('./capsuleRoutes')
const uploadRoutes=require('./uploadRoutes')

router.use('/auth',authRoutes);
router.use('/capsule',capsuleRoutes);
router.use('/upload',uploadRoutes);

module.exports=router;