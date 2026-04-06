import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../helper/response.helper";

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, "Registration successful", 201);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, "Login successful");
  },
};
