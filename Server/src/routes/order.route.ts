import { Router } from "express";
import { addOrder } from "../controllers/orders.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router()

router.post("/addOrder",authMiddleware ,addOrder)

export default router