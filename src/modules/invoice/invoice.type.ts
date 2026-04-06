import type { order, PaymentStatus } from "../../../generated/prisma";

export interface CreateInvoiceDTO {
    order_id: string;
    total: number;
    status: PaymentStatus;
}