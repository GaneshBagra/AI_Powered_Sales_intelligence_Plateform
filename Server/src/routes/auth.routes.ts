import {Response, Router} from 'express'
import {AuthenticatedRequest, authMiddleware} from "../middlewares/auth.middleware"
import { registerContoller } from '../controllers/auth.controller'

const router : Router = Router()

router.post("/register", registerContoller)

router.get("/me", authMiddleware, (req : AuthenticatedRequest,res :Response) => {
    res.status(200).json({
        success : true,
        user : req.user
    })
})


export default router