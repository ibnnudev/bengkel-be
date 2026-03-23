import type { Response, Request } from "express";
import { sosService } from "./sos.service";
import { logger } from "../../lib/logger";

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

      res.status(201).json({
        message: "SOS created",
        data: sos,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating SOS",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async autoAssign(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "ID parameter is required",
        });
      }

      const result = await sosService.autoAssign(id.toString());

      res.json({
        message: "Mechanic assigned",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sos = await sosService.getSOSDetail(id!.toString());
      res.json({
        data: sos,
      });
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
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
      res.json({
        message: "Status updated",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
