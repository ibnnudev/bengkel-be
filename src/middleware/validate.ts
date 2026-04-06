import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { sendError, formatZodErrors } from "../helper/response.helper";

export const validate = (schema: ZodType, source: "body" | "params" | "query" = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return sendError(res, "Validation error", 400, result.error);
    }
    req[source] = result.data;
    next();
  };
};
