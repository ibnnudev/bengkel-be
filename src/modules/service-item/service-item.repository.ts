import { prisma } from "../../prisma";
import type { CreateServiceItemDTO } from "./service-item.type";

export const serviceItemRepository = {
    async create(dto: CreateServiceItemDTO) {
        return await prisma.service_item.create({
            data: dto,
        });
    },

    async findByOrderId(orderId:string) {
        return await prisma.service_item.findMany({
            where: { 
                service_log: {
                    order_id: orderId
                }
            }
        })
    }
}