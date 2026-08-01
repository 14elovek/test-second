import { Request } from 'express'
import { AuthenticatedRequest } from '../interfaces/request-interface'
import ApiError from '../exceptions/api-error'

export function checkAuth<Params = any, ResBody = any, ReqBody = any, ReqQuery = any>(
  req: Request<Params, ResBody, ReqBody, ReqQuery>
): asserts req is AuthenticatedRequest<Params, ResBody, ReqBody, ReqQuery> {
  
  if (!(req as any).user) {
    throw ApiError.UnauthorizedError();
  }
}