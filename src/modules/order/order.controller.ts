import type { Response, Request } from "express";
import { orderService } from "./order.service";
import { sendSuccess, sendError } from "../../helper/response.helper";

export const orderController = {
  async createOrder(req: Request, res: Response) {
    const { user_id, vehicle_id, latitude, longitude } = req.body;

    const order = await orderService.createOrder({
      user_id,
      vehicle_id,
      latitude,
      longitude,
      schedule_at: new Date(),
    });

    return sendSuccess(res, order, "Order created", 201);
  },

  async autoAssign(req: Request, res: Response) {
    const { id }: { id?: string } = req.params;
    if (!id) return sendError(res, "ID parameter is required", 400);

    const result = await orderService.autoAssignOrder(id.toString());

    return sendSuccess(res, result, "Mechanic assigned");
  },

  async getDetail(req: Request, res: Response) {
    const { id } = req.params;
    const order = await orderService.getOrderDetail(id!.toString());
    
    return sendSuccess(res, order);
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const result = await orderService.updateStatus({
      order_request_id: id!.toString(),
      status,
    });
    return sendSuccess(res, result, "Status updated");
  },
};
