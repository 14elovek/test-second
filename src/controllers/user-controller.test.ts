import { describe, test, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app'
import mailService from '../service/mail-service'
import userModel from '../models/userModel'
import tokenModel from '../models/tokenModel'
import 'dotenv/config'

describe('userService', () => {
   let mongoServer: MongoMemoryServer

   beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create()
      await mongoose.connect(mongoServer.getUri())

      vi.spyOn(mailService, 'sendActivationLink').mockImplementation(async () => Promise.resolve())
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

   describe('POST /api/registration', () => {
      test('должен зарегестрировать пользователя и вернуть JSON с токенами и HttpOnly куку',
         async() => {
            const response = await request(app)
               .post('/api/registration')
               .send({
                  email: testEmail,
                  password: testPassword
               })

            expect(response.status).toBe(200)

            expect(response.body).toHaveProperty('refreshToken')
            expect(response.body).toHaveProperty('accessToken')
            expect(response.body).toHaveProperty('user')
            expect(response.body.user.email).toBe(testEmail)
            expect(response.body.user.isActivated).toBe(false)

            const cookieHeader = response.headers['set-cookie']
            expect(cookieHeader).toBeDefined()
            expect(cookieHeader[0]).toContain('refreshToken=')
            expect(cookieHeader[0]).toContain('HttpOnly')
         }
      )

      test('должен выбросить 400, если email уже зарегестрирован',
         async() => {
            await request(app)
               .post('/api/registration')
               .send({ email: testEmail, password: testPassword })
            
            const response = await request(app)
               .post('/api/registration')
               .send({ email: testEmail, password: testPassword })
            
            expect(response.status).toBe(400)

            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toContain('уже существует')
         }
      )
   })

   describe('POST /api/login', () => {
      test('должен авторизировать пользователя и вернуть JSON с токенами и HttpOnly куку',
         async() => {
            await request(app)
               .post('/api/registration')
               .send({ email: testEmail, password: testPassword })

            const response = await request(app)
               .post('/api/login')
               .send({ email: testEmail, password: testPassword })

            expect(response.status).toBe(200)

            expect(response.body).toHaveProperty('refreshToken')
            expect(response.body).toHaveProperty('accessToken')
            expect(response.body).toHaveProperty('user')
            expect(response.body.user.email).toBe(testEmail)
            expect(response.body.user.isActivated).toBe(false)

            const cookieHeader = response.headers['set-cookie']
            expect(cookieHeader).toBeDefined()
            expect(cookieHeader[0]).toContain('refreshToken=')
            expect(cookieHeader[0]).toContain('HttpOnly')
         }
      )

      test('должен выбросить 400, если email не зарегестрирован',
         async() => {
            const response = await request(app)
               .post('/api/login')
               .send({ email: testEmail, password: testPassword })

            expect(response.status).toBe(400)

            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toContain('не найден')
         }
      )

      test('должен выбросить 400, если неверный пароль',
         async() => {
            await request(app)
               .post('/api/registration')
               .send({ email: testEmail, password: testPassword })

            const response = await request(app)
               .post('/api/login')
               .send({ email: testEmail, password: 'wrongPass' })

            expect(response.status).toBe(400)

            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toContain('Неверный пароль')
         }
      )
   })

   describe('POST /api/logout', () => {
      test('должен деавторизировать пользователя и удалить куку',
         async() => {
            const regResponse = await request(app)
               .post('/api/registration')
               .send({ email: testEmail, password: testPassword })

            const authCookies = regResponse.headers['set-cookie']

            const response = await request(app)
               .post('/api/logout')
               .set('Cookie', authCookies)

            expect(response.status).toBe(200)

            const logoutCookie = response.headers['set-cookie']
            expect(logoutCookie).toBeDefined()
            expect(logoutCookie[0]).toContain('refreshToken=;')
         }
      )
   })

   describe('POST /api/refresh', () => {
      test('должен обновить куку и отправить JSON с токенами',
         async() => {
            const regResponse = await request(app)
               .post('/api/registration')
               .send({ email: testEmail, password: testPassword })

            const authCookies = regResponse.headers['set-cookie']
            
            const response = await request(app)
               .get('/api/refresh')
               .set('Cookie', authCookies)


            expect(response.status).toBe(200)

            expect(response.body).toHaveProperty('refreshToken')
            expect(response.body).toHaveProperty('accessToken')
            expect(response.body).toHaveProperty('user')
            expect(response.body.user.email).toBe(testEmail)
            expect(response.body.user.isActivated).toBe(false)

            const cookieHeader = response.headers['set-cookie']
            expect(cookieHeader[0]).toContain('refreshToken=')
            expect(cookieHeader[0]).toContain('HttpOnly')
         }
      )
   })

   describe('POST /api/activate', () => {
      test('должен переключить activate в true и редиректнуть на форнтенд',
         async() => {
            await request(app)
               .post('/api/registration')
               .send({ email: testEmail, password: testPassword })

            const user = await userModel.findOne({ email: testEmail }) as any
            expect(user.activationLink).toBeTruthy()

            const response = await request(app)
               .get(`/api/activate/${user.activationLink}`)

            expect(response.status).toBe(302)

            expect(response.headers.location).toBe(process.env.CLIENT_URL || 'http://localhost:5000')
            
            const updatedUser = await userModel.findOne({ email: testEmail })
            expect(updatedUser?.isActivated).toBe(true) 
         }
      )

      test('должен бросить 400, если перешли по несуществующей ссылке',
         async() => {
            const response = await request(app)
               .get(`/api/activate/fake`)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toBe('Ошибка при валидации')

            expect(response.body.errors).toBeTruthy()
            expect(response.body.errors[0].message).toBe('Некорректная ссылка активации')
         }
      )
   })
})