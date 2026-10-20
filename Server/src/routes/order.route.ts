import { Router } from "express";
import { addOrder, deleteOrder, fetchItemDetails, fetchOrders } from "../controllers/orders.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router()

router.post("/addOrder",authMiddleware ,addOrder)
router.delete("/deleteOrder",authMiddleware, deleteOrder)
router.get("/customers/:custId/orders",authMiddleware,fetchOrders)
router.post("/fetch-item-details",authMiddleware,fetchItemDetails)
export default router