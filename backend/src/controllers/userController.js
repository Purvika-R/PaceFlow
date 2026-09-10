const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (await User.exists({ email })) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role });

    res.status(201).json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};
exports.list = async (req,res,next)=>{try{res.json({success:true,data:await User.find().sort('-createdAt')});}catch(e){next(e)}};
exports.get = async (req,res,next)=>{try{const user=await User.findById(req.params.id);if(!user)return res.status(404).json({success:false,message:'User not found'});res.json({success:true,data:user});}catch(e){next(e)}};
exports.remove = async (req,res,next)=>{try{const user=await User.findByIdAndDelete(req.params.id);if(!user)return res.status(404).json({success:false,message:'User not found'});res.json({success:true,data:user});}catch(e){next(e)}};
