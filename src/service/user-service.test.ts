import { describe, test, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import userServise from './user-service'
import mailService from './mail-service'
import userModel from '../models/userModel'
import mongoose, { Types } from 'mongoose'
import tokenModel from '../models/tokenModel'
import 'dotenv/config'

describe('userService', () => {
   let mongoServer: MongoMemoryServer

   beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create()
      await mongoose.connect(mongoServer.getUri())

      vi.spyOn(mailService, 'sendActivationLink').mockImplementation(async () => {
         return Promise.resolve()
      })

      process.env.JWT_ACCESS_TOKEN = 'accessKey'
      process.env.JWT_REFRESH_TOKEN = 'refreshKey'
   })

   afterAll(async () => {
      await mongoose.disconnect()
      await mongoServer.stop()

   })

   beforeEach(async () => {
      await userModel.deleteMany({})
      await tokenModel.deleteMany({})
   })

   const testEmail = 'test@email.com'
   const testPassword = 'testPassword'
   async function regTest(email = testEmail, password = testPassword) {
      return await userServise.registration(email, password)
   }

   describe('registration', () => {
      test('должен зарегистрировать нового пользователя и создать токены',
         async() => {
            const result = await regTest()

            expect(result).toHaveProperty('accessToken')
            expect(result).toHaveProperty('refreshToken')
            expect(result).toHaveProperty('user')
            expect(result.user.email).toBe(testEmail)
            expect(result.user.isActivated).toBe(false)

            const userInDb = await userModel.findOne({ email: testEmail })
            expect(userInDb).toBeTruthy()
            expect(userInDb?.email).toBe(testEmail)
            
            expect(userInDb?.password).not.toBe(testPassword)

            expect(mailService.sendActivationLink).toHaveBeenCalledWith(
               testEmail,
               expect.stringContaining('http')
            )
         }
      )

      test('должен выбросить 400, если пользователь уже существует',
         async () => {
            await regTest()

            await expect(
               userServise.registration(testEmail, testPassword)
            ).rejects.toThrow(`Пользователь с почтой ${testEmail} уже существует`)
         }
      )
   })

   describe('login', () => {
      beforeEach(async() => {
         await regTest()
      })

      test('должен авторизировать пользователя и сгенерировать токены',
         async() => {
            const result = await userServise.login(testEmail, testPassword)

            expect(result).toHaveProperty('accessToken')
            expect(result).toHaveProperty('refreshToken')
            expect(result).toHaveProperty('user')
            expect(result.user.email).toBe(testEmail)

            const tokenInDb = await tokenModel.findOne({ user: result.user.id })
            expect(tokenInDb).not.toBeNull()
            expect(tokenInDb?.refreshToken).toBe(result.refreshToken)
         }
      )

      test('должен выбросить 400, если почты нет в БД',
         async() => {
            const wrongMail = 'wrong@mail.ru'

            await expect(
               userServise.login(wrongMail, testPassword)
            ).rejects.toThrow(`Пользователь с почтой ${wrongMail} не найден`)
         }
      )

      test('должен выбросить 400, если указан неверный пароль',
         async() => {
            const wrongPassword = 'wrongPassword'

            await expect(
               userServise.login(testEmail, wrongPassword)
            ).rejects.toThrow(`Неверный пароль`)
         }
      )
   })


   describe('logout', () => {
      test('должен удалить токен пользователя',
         async() => {
            const tokenBeforeLogout = (await regTest()).refreshToken

            const result = await userServise.logout(tokenBeforeLogout)

            const tokenAfterLogout = await tokenModel.findOne({ tokenBeforeLogout })

            expect(result.deletedCount).toBe(1)
            expect(tokenAfterLogout).toBeNull()
         }
      )

      test('не должен падать, если передан некорректный токен',
         async() => {
            const result = await userServise.logout('wrongRefreshToken')

            expect(result.deletedCount).toBe(0)
         }
      )
   })

   describe('refresh', () => {
      test('должен обновить токены',
         async() => {
            const userData = await regTest()

            const result = await userServise.refresh(userData.refreshToken)

            const tokenFromDb = await tokenModel.findOne({refreshToken: result.refreshToken})

            expect(tokenFromDb?.refreshToken).toBeTruthy()
            expect(tokenFromDb?.refreshToken).toBe(result.refreshToken)
            expect(result.refreshToken).toBe(tokenFromDb?.refreshToken)
         }
      )

      test('должен выбросить 400, если токен некоректный',
         async() => {
            await expect(
               userServise.refresh('error')
            ).rejects.toThrow('Пользователь не авторизован')
         }
      )

      test('должен выбросить 400, если токена нет в БД',
         async() => {
            vi.useFakeTimers()

            const userData = await regTest()
            const tokenBefore = userData.refreshToken

            vi.advanceTimersByTime(2000)

            await userServise.refresh(userData.refreshToken)

            await expect(
               userServise.refresh(tokenBefore)
            ).rejects.toThrow('Пользователь не авторизован')
         }
      )

      test('должен выбросить 400, если пользователя больше не существует',
         async() => {
            const userData = await regTest()
            const tokenBefore = userData.refreshToken

            await userModel.findByIdAndDelete(userData.user.id)
            
            await expect(
               userServise.refresh(tokenBefore)
            ).rejects.toThrow('Пользователь не авторизован')
         }
      )
   })

   describe('activate', () => {      
      test('должен активировать пользователя по ссылке',
         async() => {
            await regTest()

            const userFromDbBefore = await userModel.findOne({ email: testEmail })
            expect(userFromDbBefore).toBeTruthy()
            expect(userFromDbBefore?.isActivated).toBe(false)

            const activationLink = userFromDbBefore?.activationLink
            expect(activationLink).toBeTruthy()

            await userServise.activate(activationLink!)

            const userFromDbAfter = await userModel.findOne({ email: testEmail })
            expect(userFromDbAfter?.isActivated).toBe(true)
         }
      )

      test('должен выбросить 400, если ссылка активации не найдена в БД', async () => {
         await expect(
            userServise.activate('fake-activation-link')
         ).rejects.toThrow('Некорректная ссылка активации');
      })
   })

   describe('getUsers', () => {      
      test('должен вернуть всех пользователей',
         async() => {
            await regTest('email@1test.com')
            await regTest('email@2test.com')

            const users = await userServise.getUsers()
            expect(users).length(2)
         }
      )
   })
})