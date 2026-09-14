const jwt=require("jsonwebtoken")

const authmiddleware=(req,res,next) =>{
    try{
        const authheader=req.headers.authorization;
        
        if(! authheader){
            return res.status(401).json({
                message:"No token from middleware"
            })
        }
        const tokenfromheader=authheader.split(" ")[1];
        
        if(!tokenfromheader){
            return res.status(401).json({
                message: "Invalid authorization format"
            });
        }

        const decoded=jwt.verify(
            tokenfromheader,
            process.env.JWT_SECRET
        );
        console.log("Decoded token:", decoded);
        req.user=decoded;   

        next();
    }catch (e) {
        return res.status(401).json({
            message: "Invalid or expired token middleware",
            error:e
        });
    }
};

module.exports = authmiddleware;