import { OrderStatus } from "../../../generated/prisma";

export interface CreateOrderDTO {
    user_id: string;
    vehicle_id: string;
    latitude: number;
    longitude: number;
    schedule_at: Date;
}

export interface AssignMechanicDTO {
    order_id: string;
    mechanic_id: string;
}

export interface UpdateOrderStatusDTO {
    order_request_id: string;
    status: OrderStatus;
}