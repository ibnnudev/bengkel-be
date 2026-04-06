import { PaymentStatus } from "../../../generated/prisma";
import { prisma } from "../../prisma";
import type { CreateInvoiceDTO } from "./invoice.type";

export const invoiceRepository = {
    async create(dto: CreateInvoiceDTO) {
        const invoice = await prisma.invoice.create({
            data: {
                order_id: dto.order_id,
                total: dto.total,
                status: dto.status,
            },
        });

        return invoice;
    },
}