import { Request } from "express"
import UserDto from "../dto/user-dto"

export interface AuthenticatedRequest<Params={}, ResBody={}, ReqBody={}, ReqQuery={}>
  extends Request<Params, ResBody, ReqBody, ReqQuery> {
    user: UserDto
}

export interface FreeRequest<Params={}, ResBody={}, ReqBody={}, ReqQuery={}>
  extends Request<Params, ResBody, ReqBody, ReqQuery> {
    user?: UserDto
}