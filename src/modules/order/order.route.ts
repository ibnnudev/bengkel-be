import { Router } from "express";
import { orderController } from "./order.controller";

const router = Router();

router.get("/:id", orderController.getDetail);
router.post("/", orderController.createOrder);
router.post("/:id/assign", orderController.autoAssign);
router.patch("/:id/status", orderController.updateStatus);

export default router;