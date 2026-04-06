import bcrypt from "bcryptjs";
import { Role } from "../../../generated/prisma";
import { BusinessRuleError } from "../../error/business-rule.error";
import { signToken } from "../../middleware/auth";
import { prisma } from "../../prisma";
import type { RegisterInput, LoginInput } from "./auth.schema";

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (existing) {
      throw new BusinessRuleError("Phone number already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        phone: input.phone,
        password: hashedPassword,
        role: (input.role as Role) ?? Role.CUSTOMER,
      },
    });

    const token = signToken({ id: user.id, role: user.role });

    return {
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
      token,
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (!user) {
      throw new BusinessRuleError("Invalid phone or password");
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new BusinessRuleError("Invalid phone or password");
    }

    const token = signToken({ id: user.id, role: user.role });

    return {
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
      token,
    };
  },
};
