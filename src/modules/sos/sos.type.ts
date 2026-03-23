import { SOSStatus } from "../../../generated/prisma";

export interface CreateSOSDTO {
    user_id: string;
    vehicle_id: string;
    latitude: number;
    longitude: number;
}

export interface AssignMechanicDTO {
    sos_request_id: string;
    mechanic_id: string;
}

export interface UpdateSOSStatusDTO {
    sos_request_id: string;
    status: SOSStatus;
}