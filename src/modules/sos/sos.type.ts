import { SOSStatus } from "../../../generated/prisma";

export interface CreateSOSDTO {
    userId: string;
    vehicleId: string;
    latitude: number;
    longitude: number;
}

export interface AssignMechanicDTO {
    sosRequestId: string;
    mechanicId: string;
}

export interface UpdateSOSStatusDTO {
    sosRequestId: string;
    status: SOSStatus;
}