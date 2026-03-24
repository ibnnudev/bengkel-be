import type { Response, Request } from "express";
import { sosService } from "./sos.service";
import { logger } from "../../lib/logger";
import { sendSuccess, sendError } from "../../helper/response.helper";

export const sosController = {
  async createSOS(req: Request, res: Response) {
    const { user_id, vehicle_id, latitude, longitude } = req.body;
    logger.info(
      { user_id, vehicle_id, latitude, longitude },
      "Creating SOS with provided data",
    );

    const sos = await sosService.createSOS({
      user_id,
      vehicle_id,
      latitude,
      longitude,
    });

    return sendSuccess(res, sos, "SOS created", 201);
  },

  async autoAssign(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return sendError(res, "ID parameter is required", 400);
    }

    const result = await sosService.autoAssign(id.toString());

    return sendSuccess(res, result, "Mechanic assigned");
  },

  async getDetail(req: Request, res: Response) {
    const { id } = req.params;
    const sos = await sosService.getSOSDetail(id!.toString());
    logger.info({ sosId: id }, "Fetched SOS details");
    return sendSuccess(res, sos);
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const result = await sosService.updateStatus({
      sos_request_id: id!.toString(),
      status,
    });
    return sendSuccess(res, result, "Status updated");
  },
};
