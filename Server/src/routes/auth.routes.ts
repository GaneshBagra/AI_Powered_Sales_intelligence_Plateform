import {Response, Router} from 'express'
import {AuthenticatedRequest, authMiddleware} from "../middlewares/auth.middleware"
import { registerContoller,loginController, logoutController } from '../controllers/auth.controller'

const router : Router = Router()

router.post("/register", registerContoller)

router.post("/login", loginController)

router.post('/logout',logoutController)

router.get("/me", authMiddleware, (req : AuthenticatedRequest,res :Response) => {
    res.status(200).json({
        success : true,
        user : req.user
    })
})


export default router