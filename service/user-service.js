import {v4} from 'uuid'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import tokenService from './token-service.js'
import mailService from './mail-service.js'
import UserDto from '../dto/user-dto.js'
import dotenv from 'dotenv'
dotenv.config()
import ApiError from '../exceptions/api-error.js'

class UserService {
   async registration(email, password) {
      const candidate = await userModel.findOne({email})
      if (candidate) {
         throw ApiError.BadRequest(`Пользователь с почтой ${email} уже существует`)
      }

      const hashPass = await bcrypt.hash(password, 3)
      const activationLink = v4()
      const user = await userModel.create({email, password: hashPass, activationLink})
      await mailService.sendActivationLink(`${process.env.API_URL}/api/activate/${activationLink}`, email)

      const userDto = new UserDto(user)
      const tokens = await tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)

      return {...tokens, user: userDto}
   }

   async login(email, password) {
      const user = await userModel.findOne({email})
      if (!user) {
         throw ApiError.BadRequest(`Пользователь с почтой ${email} не найден`)
      }
      const isPassEquals = await bcrypt.compare(password, user.password)
      if (!isPassEquals) {
         throw ApiError.BadRequest(`Неверный пароль`)
      }

      const userDto = new UserDto(user)
      const tokens = await tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)

      return {...tokens, user: userDto}
   }

   async logout(refreshToken) {
      const token = await tokenService.removeToken(refreshToken)
      return token
   }

   async refresh(refreshToken) {
      if (!refreshToken) {
         throw ApiError.UnauthorizedError()
      }

      const userData = await tokenService.validateRefreshToken(refreshToken) //ошибка?
      const tokenFromDb = await tokenService.findToken(refreshToken)
      if (!userData || !tokenFromDb) {
         throw ApiError.UnauthorizedError()
      }

      const user = await userModel.findById(tokenFromDb.user)
      const userDto = new UserDto(user)
      const tokens = await tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)

      return {...tokens, user: userDto}
   }

   async activate(activationLink) {
      const user = await userModel.findOne({activationLink})
      if (!user) throw ApiError.BadRequest('Некорректная ссылка активации')   
      user.isActivated = true
      await user.save()
   }

   async getUsers() {
      const users = await userModel.find({})
      return users
   }
}

export default new UserService