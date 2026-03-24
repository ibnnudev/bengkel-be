import { type Response } from 'express'
import { formatError as formatZodError } from 'zod'
import { logger } from '../lib/logger'

export type ApiMeta = {
  page?: number
  perPage?: number
  total?: number
  [key: string]: any
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  meta?: ApiMeta
}

export const formatSuccess = <T = any>(data?: T, message = 'Success', meta?: ApiMeta): ApiResponse<T> => ({
  success: true,
  message,
  data,
  meta,
})

export const sendSuccess = <T = any>(res: Response, data?: T, message = 'Success', status = 200, meta?: ApiMeta) => {
  return res.status(status).json(formatSuccess(data, message, meta))
}

export const formatZodErrors = (err: unknown) => {
  try {
    return formatZodError(err as any)
  } catch {
    return undefined
  }
}

export const sendError = (
  res: Response,
  message = 'Internal Server Error',
  status = 500,
  error?: unknown
) => {
  if (error) {
    logger.error({ error }, "Error response: %s", message);
  }

  const body: any = { success: false, message }

  const zodErrors = formatZodErrors(error)
  if (zodErrors) {
    body.errors = zodErrors
  } else if (process.env.NODE_ENV !== 'production' && error) {
    body.error = typeof error === 'string' ? error : (error instanceof Error ? error.message : error)
  }

  return res.status(status).json(body)
}

export default {
  formatSuccess,
  sendSuccess,
  sendError,
}
