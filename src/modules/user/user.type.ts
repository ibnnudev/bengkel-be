import { Role } from "../../../generated/prisma/client";

export interface CreateUserDTO {
    name: string;
    phone: string;
    password: string;
    role?: Role;
}

export interface UpdateUserDTO {
    name?: string;
    phone?: string;
}