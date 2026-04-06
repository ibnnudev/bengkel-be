import { Router } from "express";
import { orderController } from "./order.controller";
import { verifyToken, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createOrderSchema, updateStatusSchema, orderIdParamSchema } from "./order.schema";

const router = Router();

router.use(verifyToken);

router.get("/:id", validate(orderIdParamSchema, "params"), orderController.getDetail);
router.post("/", validate(createOrderSchema), orderController.createOrder);
router.post("/:id/assign", validate(orderIdParamSchema, "params"), requireRole("ADMIN", "CUSTOMER"), orderController.autoAssign);
router.patch("/:id/status", validate(orderIdParamSchema, "params"), validate(updateStatusSchema), orderController.updateStatus);

export default router;
