const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.authorizeUser = async(req,res,next) => {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1]
   if(token===null) {return res.status(401).json('You nedd to login to acess this page');}
    jwt.verify(token, process.env.JWT_SECRET, (err,user) => {
     if(err) {return res.status(403).json({err});}
      req.user = user;
       next();
      });
   }