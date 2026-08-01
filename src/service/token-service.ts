import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
import tokenModel from '../models/tokenModel'
import UserDto from "../dto/user-dto"

class TokenService {
   async generateTokens(payload: UserDto) {
      const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN!, {expiresIn:'1h'})
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN!, {expiresIn:'30d'})

      return {
         accessToken,
         refreshToken
      }
   }

   async saveToken(userId: string, refreshToken: string) {
      return await tokenModel.findOneAndUpdate(
         {user: userId},
         { refreshToken},
         { new: true, upsert: true }   
      )
   }

   validateRefreshToken(refreshToken: string): UserDto | null {
      try {
         return jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN!) as UserDto
      } catch(err) {
         return null
      }
   }

   validateAccessToken(accessToken: string): UserDto | null {
      try {
         return jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN!) as UserDto
      } catch(err) {
         return null
      }
   }

   async findToken (refreshToken: string) {
      return await tokenModel.findOne({refreshToken})
   }

   async removeToken(refreshToken: string) {
      return await tokenModel.deleteOne({refreshToken})
   }
}

export default new TokenService