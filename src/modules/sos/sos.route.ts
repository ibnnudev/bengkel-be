import { Router } from "express";
import { sosController } from "./sos.controller";

const router = Router();

router.post("/", sosController.createSOS);
router.post("/:id/assign", sosController.autoAssign);
router.get("/:id", sosController.getDetail);
router.patch("/:id/status", sosController.updateStatus);

export default router;