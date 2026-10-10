import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../DB/Prisma";
import { Role } from "../generated/browser";

interface RegisterData {
    username : string,
    password : string
    fullName : string
    role : Role
}

export const registerContoller  = async (req : AuthenticatedRequest,res : Response) => {
    const {fullName, username, password,role }  = req.body as RegisterData
    if (!fullName || !username || !password || !role){
        res.status(400).json({
            success : false,
            message : "full name , username , password is required"
        })

        const existingUser = await prisma.user.findUnique({
            where : {username}
        })

        if(existingUser) {
            res.status(403).json({
                success : false,
                message : `${username} already exits`
            })
        }

        const createUser = await prisma.user.create({
            data : {
                fullName,
                passwordHash : password,
                username,
                role 
            },
            select : {
                id : true,
                fullName : true,
                username : true,
                role : true,
                isActive : true,
                createdAt : true
            }   
        })

        res.status(200).json({
            success : true,
            Message : "User created successfully",
            data : createUser
        })
    }
}