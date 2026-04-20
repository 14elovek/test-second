import jwt from 'jsonwebtoken'
import dotenv from "dotenv"
dotenv.config()
import tokenModel from '../models/tokenModel.js'

class TokenService {
   async generateTokens(payload) {
      const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {expiresIn:'1h'})
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {expiresIn:'30d'})

      return {
         accessToken,
         refreshToken
      }
   }

   async saveToken(userId, refreshToken) {
      const tokenData = await tokenModel.findOne({user: userId})
      if (tokenData) {
         tokenData.refreshToken = refreshToken
         return await tokenData.save()
      }
      const token = await tokenModel.create({user: userId, refreshToken})
      return token
   }

   validateRefreshToken(refreshToken) {
      try {
         const userData = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN)
         return userData
      } catch(err) {
         return null
      }
   }

   validateAccessToken(accessToken) {
      try {
         const userData = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN)
         return userData
      } catch(err) {
         return null
      }
   }

   async findToken (refreshToken) {
      try {
         const userData = await tokenModel.findOne({refreshToken})
         return userData
      } catch(err) {
         return null
      }
   }

   async removeToken(refreshToken) {
      const tokenData = await tokenModel.deleteOne({refreshToken})
      return tokenData
   }
}

export default new TokenService