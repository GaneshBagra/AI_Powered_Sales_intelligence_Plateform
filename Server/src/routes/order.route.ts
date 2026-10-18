import { Router } from "express";
import { addOrder, deleteOrder } from "../controllers/orders.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router()

router.post("/addOrder",authMiddleware ,addOrder)
router.delete("/deleteOrder",authMiddleware, deleteOrder)


export default router