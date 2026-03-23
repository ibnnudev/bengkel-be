import type { Response, Request } from "express";
import { sosService } from "./sos.service";
import { logger } from "../../lib/logger";
import { sendSuccess, sendError } from "../../helper/response.helper";

export const sosController = {
  async createSOS(req: Request, res: Response) {
    try {
      const { user_id, vehicle_id, latitude, longitude } = req.body;
      logger.info({ user_id, vehicle_id, latitude, longitude }, "Creating SOS with provided data");

      const sos = await sosService.createSOS({
        user_id,
        vehicle_id,
        latitude,
        longitude,
      });

      return sendSuccess(res, sos, 'SOS created', 201);
    } catch (error) {
      return sendError(res, 'Error creating SOS', 500, error instanceof Error ? error.message : error);
    }
  },

  async autoAssign(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, 'ID parameter is required', 400);
      }

      const result = await sosService.autoAssign(id.toString());

      return sendSuccess(res, result, 'Mechanic assigned');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Unknown error', 500, error);
    }
  },

  async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sos = await sosService.getSOSDetail(id!.toString());
      logger.info({ sosId: id }, "Fetched SOS details");
      return sendSuccess(res, sos);
    } catch (error) {
      logger.error({ sosId: req.params.id, error }, "Error fetching SOS details");
      return sendError(res, error instanceof Error ? error.message : 'Not found', 404, error);
    }
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const result = await sosService.updateStatus({
        sos_request_id: id!.toString(),
        status,
      });
      return sendSuccess(res, result, 'Status updated');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Bad request', 400, error);
    }
  },
};
