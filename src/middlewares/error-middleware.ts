import ApiError from '../exceptions/api-error'
import { ErrorRequestHandler } from 'express'
import 'dotenv/config'

const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
   if (err instanceof ApiError) {
      return res.status(err.status).json({message: err.message, errors: err.errors})
   }
   console.log(err)
   res.status(500).json({message: 'Непредвиденная ошибка'})
}

export default errorMiddleware