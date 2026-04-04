import { Router } from "express";
import { sosController } from "./sos.controller";

const router = Router();

router.get("/:id", sosController.getDetail);
router.post("/", sosController.createSOS);
router.post("/:id/assign", sosController.autoAssign);
router.patch("/:id/status", sosController.updateStatus);

export default router;