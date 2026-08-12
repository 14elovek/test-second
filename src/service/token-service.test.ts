import { describe, test, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Types } from 'mongoose'
import tokenModel from '../models/tokenModel'
import userModel from '../models/userModel'
import tokenService from './token-service'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

describe('tokenService', () => {
   let mongoServer: MongoMemoryServer

   beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create()
await mongoose.connect(mongoServer.getUri())

      process.env.JWT_ACCESS_TOKEN = 'accessKey'
      process.env.JWT_REFRESH_TOKEN = 'refreshKey'
   })

   afterAll(async () => {
      await mongoose.disconnect()
      await mongoServer.stop()
   })

   beforeEach(async () => {
      await tokenModel.deleteMany({})
      await userModel.deleteMany({})
   })

   describe('generateTokens', () => {
      test('должен сгенерировать пару токенов из дто',
         async() => {
            const mockDto = {
               id: 'user1',
               email: 'user@user.com',
               isActivated: true
            }
            const tokens = tokenService.generateTokens(mockDto)

            const decodedAccess = jwt.verify(tokens.accessToken, process.env.JWT_ACCESS_TOKEN!) as any
            expect(decodedAccess.email).toBe(mockDto.email)
            expect(decodedAccess.id).toBe(mockDto.id)

            const decodedRefresh = jwt.verify(tokens.refreshToken, process.env.JWT_REFRESH_TOKEN!) as any
            expect(decodedRefresh.email).toBe(mockDto.email)
            expect(decodedRefresh.id).toBe(mockDto.id)
         }
      )
   })

   describe('saveToken', () => {
      test('должен сохранить переданный токен с привязкой к юзеру',
         async() => {
            const userId = new Types.ObjectId().toString()

            await tokenService.saveToken(userId, 'refreshToken')

            const result = await tokenModel.findOne({ user: userId }) as any
            expect(result.user.toString()).toBe(userId)
            expect(result.refreshToken).toBe('refreshToken')
         }
      )
   })

   describe('validateAccessToken', () => {
      test('должен валидировать и вернуть содержимое access токена или null, если токен не валидный',
         async() => {
            const mockDto = {
               id: 'user1',
               email: 'user@user.com',
               isActivated: true
            }
            const tokens = tokenService.generateTokens(mockDto)

            const result = tokenService.validateAccessToken(tokens.accessToken) as any
            expect(result.id).toBe(mockDto.id)
            expect(result.email).toBe(mockDto.email)

            expect(
               tokenService.validateAccessToken('wrong')
            ).toBeNull()
         }
      )
   })

   describe('validateRefreshToken', () => {
      test('должен валидировать и вернуть содержимое токена или null, если токен не валидный',
         async() => {
            const mockDto = {
               id: 'user1',
               email: 'user@user.com',
               isActivated: true
            }
            const tokens = tokenService.generateTokens(mockDto)

            const result = tokenService.validateRefreshToken(tokens.refreshToken) as any
            expect(result.id).toBe(mockDto.id)
            expect(result.email).toBe(mockDto.email)

            expect(
               tokenService.validateRefreshToken('wrong')
            ).toBeNull()
         }
      )
   })
})