import { type Response } from 'express'

export type ApiMeta = {
  page?: number
  perPage?: number
  total?: number
  [key: string]: any
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  meta?: ApiMeta
  error?: any
}

export const formatSuccess = <T = any>(data?: T, message = 'Success', meta?: ApiMeta): ApiResponse<T> => ({
  success: true,
  message,
  data,
  meta,
})

export const formatError = (message = 'Internal Server Error', error?: any): ApiResponse<null> => ({
  success: false,
  message,
  error,
})

export const sendSuccess = <T = any>(res: Response, data?: T, message = 'Success', status = 200, meta?: ApiMeta) => {
  return res.status(status).json(formatSuccess(data, message, meta))
}

export const sendError = (res: Response, message = 'Internal Server Error', status = 500, error?: any) => {
  return res.status(status).json(formatError(message, error))
}

export default {
  formatSuccess,
  formatError,
  sendSuccess,
  sendError,
}
