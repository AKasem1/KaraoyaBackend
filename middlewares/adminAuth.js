const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')

const adminAuth = async (req,res,next) =>{
    //verify authentication
    const {authorization} = req.headers
    if(!authorization){
        return res.status(401).json({error: "Authorization token is required"})
    }
    const token = authorization.split(' ')[1]
    try{
        const {_id} = jwt.verify(token, process.env.SECRET)
        const admin = await User.findOne({ _id })
        if (!admin) {
        throw Error('Invalid user');
        }
        if(admin.role !== 'admin'){
            throw Error('You are not authorized to access this route')
        }
        res.adminId = _id;
        req.admin = admin;
        next()
    }
    catch{
        res.status(401).json({error: 'Request is not authorized'})
    }
}
module.exports = adminAuth