import { AppError } from "./app.error";

export class NotFoundError extends AppError {
  constructor(entity: string) {
    super(`${entity} not found`, 404)
  }
}