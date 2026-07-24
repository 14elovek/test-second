import ApiError from '../exceptions/api-error'
import { ErrorRequestHandler } from 'express'

const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
   console.log(err)
   if (err instanceof ApiError) {
      return res.status(err.status).json({message: err.message, errors: err.errors})
   }
   res.status(500).json({message: 'Непредвиденная ошибка'})
}

export default errorMiddleware