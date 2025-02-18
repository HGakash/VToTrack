import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from 'path'


dotenv.config({ path: path.resolve("../.env") });

const JWT_SECRET = process.env.JWT_SECRET
console.log('hii');
console.log(JWT_SECRET);

const authMidlleware = (req,res,next) => {
    const token = req.header("Authorization");
    console.log(token);
    if(!token) {        
        return res.status(401).json({error:"Access denied. No token provided"});
    }

    try {
        //verify token (remove "Bearer prefix before verifying")
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET );
        console.log(decoded);
        req.user = decoded; //store user data in request object
        next(); //proceed to the next middleware

    } catch (err) {
        res.status(403).json({error:"invalid token"})
    }
}


export default authMidlleware
