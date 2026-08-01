import ApiError from '../exceptions/api-error'
import tokenService from '../service/token-service'
import { Response, NextFunction } from 'express'
import { FreeRequest } from '../interfaces/request-interface'

export default function authMiddleware(req: FreeRequest, res: Response, next: NextFunction) {
      const authHeader = req.headers.authorization
      if (!authHeader) {
         return next(ApiError.UnauthorizedError())
      }

      const accessToken = authHeader.split(' ')[1]
      if (!accessToken) {
         return next(ApiError.UnauthorizedError())
      }

      const userData = tokenService.validateAccessToken(accessToken)
      if (!userData) {
         return next(ApiError.UnauthorizedError())
      }

      req.user = userData
      return next()
}