import {Request, Response,NextFunction} from "express"
import jwt from "jsonwebtoken"
import { AuthenticatedUserPayload } from "../utils/types"



export interface AuthenticatedRequest extends Request {
    user? : AuthenticatedUserPayload
}

export const authMiddleware = (req:AuthenticatedRequest,res:Response,next :NextFunction) : void => {
    
    const headerToken = req.headers.cookie?.split("=")[1]

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
        const decoded = jwt.verify(headerToken,secret) as AuthenticatedUserPayload
        req.user = decoded 
        next()
    }catch(err : any){
        res.status(403).json({
            message : "Forbidden access. Invalid token.",
        })
        return
    } 


}

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permissions for this action",
      });
      return;
    }
    next();
  };
};