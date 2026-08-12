import { describe, test, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app'
import mailService from '../service/mail-service'
import tokenModel from '../models/tokenModel'
import expenseModel from '../models/expenseModel'
import 'dotenv/config'

describe('expenseService', () => {
   let mongoServer: MongoMemoryServer

   let accessToken: string
   let userId: string

   beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create()
      await mongoose.connect(mongoServer.getUri())

      vi.spyOn(mailService, 'sendActivationLink').mockImplementation(async () => Promise.resolve())

      const response = await request(app)
         .post('/api/registration')
         .send({ email: 'test@email.com', password: 'testPass'})
      accessToken = response.body.accessToken
      userId = response.body.user.id
   })

   afterAll(async () => {
      await mongoose.disconnect()
      await mongoServer.stop()
   })

   beforeEach(async () => {
      await tokenModel.deleteMany({})
      await expenseModel.deleteMany({})
   })

   describe('POST /api/addExpense', () => {
      test('должен добавить новый расход пользователю',
         async() => {
            const response = await request(app)
               .post('/api/addExpense')
               .set('Authorization', `Bearer ${accessToken}`)
               .send({ title: 'молоко', sum: 200, category: 'продукты' })

            expect(response.status).toBe(200)
            expect(response.body).toEqual({ success: true })
         }
      )

      test('должен бросить 401, если не авторизован',
         async() => {
            const response = await request(app)
               .post('/api/addExpense')
               .set('Authorization', `Bearer fake`)
               .send({ title: 'молоко', sum: 200, category: 'продукты' })

            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Пользователь не авторизован')
         }
      )

      test('должен бросить 400, если невалидный формат данных',
         async () => {
            const response = await request(app)
               .post('/api/addExpense')
               .set('Authorization', `Bearer ${accessToken}`)
               .send({ title: 'молоко', sum: 'ошибка', category: 'продукты' })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Ошибка при валидации')
         }
      )
   })

   describe('GET /api/expenses', () => {
      test('должен вернуть все расходы пользователя',
         async() => {
            await expenseModel.create({
               user: userId, sum: 200, title: 'молоко', date: new Date(), category: 'продукты'
            })
            await expenseModel.create({
               user: userId, sum: 300, title: 'печенье', date: new Date()
            })

            const response = await request(app)
               .get('/api/expenses')
               .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toEqual([
               expect.objectContaining({ title: 'молоко', sum: 200, category: 'продукты' }),
               expect.objectContaining({ title: 'печенье', sum: 300})
            ])
         }
      )

      test('должен бросить 401, если не авторизован',
         async() => {
            const response = await request(app)
               .get('/api/expenses')
               .set('Authorization', `Bearer fake`)

            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Пользователь не авторизован')
         }
      )
   })

   describe('GET /api/expenses/search', () => {
      test('должен вернуть расходы пользователя за указанный период',
         async() => {
            await expenseModel.create({
               user: userId, sum: 300, title: 'в диапазоне', date: new Date('2025-02-03')
            })
            await expenseModel.create({
               user: userId, sum: 100, title: 'не в диапазоне', date: new Date('2025-03-05')
            })

            const response = await request(app)
               .get('/api/expenses/search')
               .query({ dateFrom: '2025-02-01', dateTo: '2025-03-03' })
               .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toEqual([
               expect.objectContaining({ title: 'в диапазоне', sum: 300 })
            ])
            expect(response.body).not.toEqual([
               expect.objectContaining({ title: 'не в диапазоне', sum: 100 })
            ])
         }
      )

      test('должен бросить 401, если не авторизован',
         async() => {
            const response = await request(app)
               .get('/api/expenses/search')
               .query({ dateFrom: '2025-02-01', dateTo: '2025-03-03' })
               .set('Authorization', `Bearer fake`)

            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Пользователь не авторизован')
         }
      )

      test('должен бросить 400, если невалидный формат дат',
         async () => {
            const response = await request(app)
               .get('/api/expenses/search')
               .query({ dateFrom: '2025-02-123', dateTo: '2025-03-03' })
               .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Ошибка при валидации')
         }
      )
   })

   describe('PATCH /api/updateExpense', () => {
      test('должен обновить расход',
         async() => {
            const expense = await expenseModel.create({
               user: userId, sum: 100, title: 'не в диапазоне', date: new Date('2025-03-05')
            })
            const response = await request(app)
               .patch('/api/updateExpense')
               .set('Authorization', `Bearer ${accessToken}`)
               .send({ expenseId: expense.id.toString(), sum: 200 })
            expect(response.status).toBe(200)
            expect(response.body).toEqual({ success: true })
         }
      )

      test('должен бросить 401, если не авторизован',
         async() => {
            const response = await request(app)
               .patch('/api/updateExpense')
               .set('Authorization', `Bearer token`)

            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Пользователь не авторизован')
         }
      )

      test('должен бросить 400, если расход с таким ID не найден в базе',
         async () => {
            const fakeObjectId = '65c123456789abcdef012345'

            const response = await request(app)
               .patch('/api/updateExpense')
               .set('Authorization', `Bearer ${accessToken}`)
               .send({ expenseId: fakeObjectId, sum: 200 })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Расход с таким ID не найден')
         }
      )
   })

   describe('GET /api/expenses/date', () => {
      test('должен вернуть все расходы пользователя за указанный месяц',
         async() => {
            await expenseModel.create({
               user: userId, sum: 100, title: 'в диапазоне', date: new Date('2025-03-05')
            })
            await expenseModel.create({
               user: userId, sum: 200, title: 'не в диапазоне', date: new Date('2025-04-05')
            })
            const response = await request(app)
               .get('/api/expenses/date')
               .query({ date: '2025-03-12' })
               .set('Authorization', `Bearer ${accessToken}`)
               
            expect(response.status).toBe(200)
            expect(response.body.expenses).toEqual([
               expect.objectContaining({ sum: 100, title: 'в диапазоне' })
            ])
         }
      )

      test('должен бросить 401, если не авторизован',
         async() => {
            const response = await request(app)
               .get('/api/expenses/date')
               .set('Authorization', `Bearer token`)

            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Пользователь не авторизован')
         }
      )

      test('должен бросить 400, если невалидный формат даты',
         async () => {
            const response = await request(app)
               .get('/api/expenses/date')
               .query({ date: '2025-03' })
               .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Ошибка при валидации')
         }
      )
   })

      describe('DELETE /api/expenses/:expenseId', () => {
      test('должен удалить расход пользователя',
         async() => {
            const expense = await expenseModel.create({
               user: userId, sum: 100, title: 'молоко', date: new Date('2025-03-05')
            })
            const response = await request(app)
               .delete(`/api/expenses/${expense.id}`)
               .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toEqual({ success: true })
         }
      )

      test('должен бросить 401, если не авторизован',
         async() => {
            const response = await request(app)
               .delete(`/api/expenses/expenseId`)
               .set('Authorization', `Bearer token`)

            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Пользователь не авторизован')
         }
      )

      test('должен бросить 400, если невалидный id расхода',
         async () => {
            const expense = await expenseModel.create({
               user: userId, sum: 100, title: 'молоко', date: new Date('2025-03-05')
            })
            const response = await request(app)
               .delete(`/api/expenses/expenseId`)
               .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Ошибка при валидации')
         }
      )
   })
})