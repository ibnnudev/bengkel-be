import type { AssignmentStatus } from "../../../generated/prisma";
import { STACKHOLDER } from "../../constants/stackholder";
import { NotFoundError } from "../../error/not-found.error";
import { prisma } from "../../prisma";

export const assignmentRepository = {
    async findById(id: string) {
        return await prisma.assignment.findFirstOrThrow({
            where: { id },
        }).catch(() => {
            throw new NotFoundError(STACKHOLDER.ASSIGMENT);
        });
    },

    async findByMechanicAndOrderId(mechanicId: string, orderId: string) {
        return await prisma.assignment.findFirstOrThrow({
            where: {
                mechanic_id: mechanicId,
                order_id: orderId,
            },
        }).catch(() => {
            throw new NotFoundError(STACKHOLDER.ASSIGMENT);
        });
    },

    async updateStatus(id: string, status: AssignmentStatus) {
        return await prisma.assignment.update({
            where: { id },
            data: { status },
        }).catch(() => {
            throw new NotFoundError(STACKHOLDER.ASSIGMENT);
        });
    }
};