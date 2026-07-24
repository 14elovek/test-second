import { Request } from "express"
import UserDto from "../dto/user-dto"

export interface AppRequest<Params={}, ResBody={}, ReqBody={}, ReqQuery={}>
    extends Request<Params, ResBody, ReqBody, ReqQuery> {
        user?: UserDto
}

export interface AuthenticatedRequest<P={}, Res={}, ReqB={}, ReqQ={}>
   extends AppRequest<P, Res, ReqB, ReqQ> {
      user: UserDto
}