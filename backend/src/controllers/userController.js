const User = require('../models/User');
exports.create = async (req,res,next)=>{try{const user=await User.create(req.body);res.status(201).json({success:true,data:user});}catch(e){next(e)}};
exports.list = async (req,res,next)=>{try{res.json({success:true,data:await User.find().sort('-createdAt')});}catch(e){next(e)}};
exports.get = async (req,res,next)=>{try{const user=await User.findById(req.params.id);if(!user)return res.status(404).json({success:false,message:'User not found'});res.json({success:true,data:user});}catch(e){next(e)}};
exports.remove = async (req,res,next)=>{try{const user=await User.findByIdAndDelete(req.params.id);if(!user)return res.status(404).json({success:false,message:'User not found'});res.json({success:true,data:user});}catch(e){next(e)}};
