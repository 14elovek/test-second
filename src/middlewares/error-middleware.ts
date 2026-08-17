import ApiError from '../exceptions/api-error'
import { ErrorRequestHandler } from 'express'
import 'dotenv/config'
import { logger } from '../utils/logger'

const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
   logger.error({
      method: req.method,
      url: req.url,
      err: err instanceof Error ? { message: err.message, stack: err.stack } : err
   }, 'Произошла ошибка при обработке запроса')

   if (err instanceof ApiError) {
      return res.status(err.status).json({ message: err.message, errors: err.errors })
   }

   res.status(500).json({ message: 'Непредвиденная ошибка' })
}

export default errorMiddleware