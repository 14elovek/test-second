import ApiError from '../exceptions/api-error.js'
import tokenService from '../service/token-service.js'

export default function(req, res, next) {
   try {
      const accessToken = req.headers.authorization.split(' ')[1]
      if (!accessToken) {
         throw next(ApiError.UnauthorizedError())
      }
      const userData = tokenService.validateAccessToken(accessToken)
      if (!userData) {
         throw next(ApiError.UnauthorizedError())
      }

      req.user = userData
      next()
   } catch(err) {
      return next(ApiError.UnauthorizedError())
   }
}