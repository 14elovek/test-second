import { describe, test, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import expensesService from './expenses-service'
import expenseModel from '../models/expenseModel'
import mongoose, { Types } from 'mongoose'

describe('expensesService', () => {
   let mongoServer: MongoMemoryServer
   const testUserId = new Types.ObjectId()

   beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create()
      await mongoose.connect(mongoServer.getUri())
   })

   afterAll(async () => {
      await mongoose.disconnect()
      await mongoServer.stop()
   })

   beforeEach(async () => {
      await expenseModel.deleteMany({})
   })

   const createExpense = (overrides = {}) => ({
      _id: new Types.ObjectId(),
      user: testUserId,
      sum: 250,
      title: 'Стандартный расход',
      date: new Date(),
      category: 'Еда',
      ...overrides
   })

   describe('addExpense', () => {
      test('должен создать расход',
      async () => {
         const expense = await expensesService.addExpense(
            testUserId.toString(),
            250,
            'Продукты',
            'Еда'
         )

         expect(expense).toBeTruthy()
         expect(expense.title).toBe('Продукты')

         const expenseInDb = await expenseModel.findById(expense._id)
         expect(expenseInDb).not.toBeNull()
         expect(expenseInDb?.sum).toBe(250)
      })
   })

   describe('getExpenses', () => {
      test('должен вернуть список всех расходов пользователя и метаданные на указанной странице',
      async () => {
         await expenseModel.insertMany([
            createExpense({user: new Types.ObjectId(), sum: 67, title: 'Лечение'}),
            createExpense({sum: 150, title: 'Кофе', date: new Date('2026-01-02')}),
            createExpense({sum: 1200, title: 'Продукты', date: new Date('2026-01-01')})
         ])

         const result = await expensesService.getExpenses(1, 10, testUserId.toString())

         expect(result).toBeTruthy()
         expect(result.expenses).toHaveLength(2)

         expect(result.expenses[0].title).toBe('Кофе')
         expect(result.expenses[0].sum).toBe(150)
         expect(result.expenses[1].title).toBe('Продукты')
         expect(result.expenses[1].sum).toBe(1200)
         expect(result.expenses[0].user.toString()).toBe(testUserId.toString())

         expect(result.meta.currentPage).toBe(1)
         expect(result.meta.limit).toBe(10)
         expect(result.meta.totalItems).toBe(2)
         expect(result.meta.totalPages).toBe(1)
      })
   })

   describe('getSortExpenses', () => {
      test('должен вернуть список отсортированных расходов и метаданные на указанной странице',
      async () => {         
         await expenseModel.insertMany([
            createExpense({user: new Types.ObjectId(), sum: 67, title: 'Лечение', date: new Date('2026-02-01')}),
            createExpense({sum: 150, title: 'Кофе', date: new Date('2026-02-01')}),
            createExpense({sum: 1200, title: 'Продукты', date: new Date('2026-03-01')})
         ])

         const dateFrom = '2026-01-01'
         const dateTo = '2026-02-25'
         const page = 1
         const limit = 10

         const result = await expensesService.getSortExpenses(
            dateFrom,
            dateTo,
            page,
            limit,
            testUserId.toString()
         )

         expect(result.expenses).toHaveLength(1)
         expect(result.expenses[0].sum).toBe(150)

         expect(result.meta.currentPage).toBe(1)
         expect(result.meta.limit).toBe(10)
         expect(result.meta.totalItems).toBe(1)
         expect(result.meta.totalPages).toBe(1)
      })
   })

   describe('updateExpense()', () => {
      const expenseId = new Types.ObjectId()

      test('должен обновить переданные поля', async () => {
         await expenseModel.insertMany([
            createExpense({sum: 150, title: 'Кофе', date: new Date('2026-02-01')}),
            createExpense({_id: expenseId, sum: 1200, title: 'Продукты', date: new Date('2026-03-01')})
         ])

         await expensesService.updateExpense(
            testUserId.toString(),
            expenseId.toString(),
            undefined,
            'Новое название'
         )

         const expense = await expenseModel.findById(expenseId)
         expect(expense).toBeTruthy()
         expect(expense?.sum).toBe(1200)
         expect(expense?.title).toBe('Новое название')
      })

      test('должен выбросить 403, если расход принадлежит другому пользователю', async () => {
         await expenseModel.create(createExpense({_id: expenseId}))

         await expect(
            expensesService.updateExpense(
               new Types.ObjectId().toString(),
               expenseId.toString(),
               undefined,
               'хакер'
            )
         ).rejects.toThrow('Отказано в доступе')
      })
   })

   describe('getExpensesForMonth()', () => {
      test('должен вернуть список расходов за указаный месяц на указанной странице', async () => {
         const testDateStrFirst = '2026-05-15T00:00:00.000Z'
         const testDateStrSecond = '2026-05-15T00:01:00.000Z'
         const page = 1
         const limit = 10
         
         await expenseModel.insertMany([
            createExpense({ sum: 300, title: 'Продукты', date: new Date(testDateStrFirst) }),
            createExpense({ sum: 150, title: 'Кофе', date: new Date(testDateStrSecond) }),
            createExpense({ sum: 350, title: 'мало', date: new Date('2026-04-28T00:00:00.000Z') }),
            createExpense({ sum: 100, title: 'много', date: new Date('2026-06-01T00:00:00.000Z') }),
         ])

         const result = await expensesService.getExpensesForMonth(
            testDateStrFirst,
            page,
            limit,
            testUserId.toString()
         )

         expect(result.totalSum).toBe(450)
         expect(result.expenses).toHaveLength(2)
         expect(result.expenses[0].sum).toBe(150)
         expect(result.expenses[1].sum).toBe(300)

         expect(result.meta.currentPage).toBe(1)
         expect(result.meta.limit).toBe(10)
         expect(result.meta.totalItems).toBe(2)
         expect(result.meta.totalPages).toBe(1)
      })
   })

   describe('removeExpense()', () => {
      const expenseId = new Types.ObjectId()

      test('должен удалить расход', async () => {
         await expenseModel.create(createExpense({_id: expenseId}))

         const removedExpense = await expensesService.removeExpense(expenseId.toString(), testUserId.toString())
         const emptyExpense = await expenseModel.findById(expenseId)

         expect(removedExpense).toBeTruthy()
         expect(removedExpense?._id.toString()).toBe(expenseId.toString())
         expect(emptyExpense).toBeNull()
      })

      test('должен выбросить 400, если расход не найден', async () => {
         await expect(
            expensesService.removeExpense(expenseId.toString(), testUserId.toString())
         ).rejects.toThrow('Расход не найден')
      })

      test('должен выбросить 403, если расход принадлежит другому пользователю', async () => {
         const alienUserId = new Types.ObjectId()

         await expenseModel.create(createExpense({_id: expenseId,}))

         await expect(
            expensesService.removeExpense(expenseId.toString(), alienUserId.toString())
         ).rejects.toThrow('Отказано в доступе')
      })
  })
})