import { z } from "zod";

export const createOrderSchema = z.object({
  vehicle_id: z.string().uuid("Invalid vehicle ID"),
  latitude: z.number({ message: "Latitude is required" }).min(-90).max(90),
  longitude: z.number({ message: "Longitude is required" }).min(-180).max(180),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "REQUESTED",
    "ASSIGNED",
    "ON_THE_WAY",
    "ON_PROGRESS",
    "WAITING_APPROVAL",
    "DONE",
    "CANCELED",
  ]),
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid("Invalid order ID"),
});
