import {Request, Response,NextFunction} from "express"
import jwt from "jsonwebtoken"

export interface AutheticatedUserPayload {
    id : string ,
    Role : string
}

export interface AuthenticatedRequest extends Request {
    user? : AutheticatedUserPayload
}

export const authMiddleware = (req:AuthenticatedRequest,res:Response,next :NextFunction) : void => {
    console.log(req.headers.authorization)
    const headerToken = req.headers.authorization?.split(" ")[1]

    if (!headerToken) {
        res.status(401).json({
            message : "Unauthorized access. Token is missing.",
            status : "Unauthorized",
            timestamp : new Date().toISOString()
        })
        return;
    }

    const secret = process.env.JWT_SECRET || "fallback_secret_key";
    try {
        const decoded = jwt.verify(headerToken,secret) as AutheticatedUserPayload
        req.user = decoded 
        next()
    }catch(err : any){
        res.status(403).json({
            message : "Forbidden access. Invalid token.",
        })
        return
    } 


}