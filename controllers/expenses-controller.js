import dotenv from 'dotenv'
dotenv.config()
import expensesService from '../service/expenses-service.js'
import { validationResult } from 'express-validator'
import ApiError from '../exceptions/api-error.js'

class ExpensesController {
   async getExpenses(req, res, next) {
      try {
         const expenses = await expensesService.getExpenses(req.user.id)
         return res.json(expenses)
      } catch(err) {
         next(err)
      }
   }

   async addExpense(req, res, next) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
         }

         await expensesService.addExpense(req.user.id, req.body.sum, req.body.title, req.body.category)
         return res.sendStatus(200)
      } catch(err) {
         next(err)
      }
   }

   async updateExpense(req, res, next) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
         }

         await expensesService.updateExpense(req.user.id, req.body.sum, req.body.title, req.body.category)
         return res.sendStatus(200)
      } catch(err) {
         next(err)
      }
   }

   async getExpensesForMonth(req, res, next) {
      try {
         const expenses = await expensesService.getExpensesForMonth(req.user.id)
         return res.json(expenses)
      } catch(err) {
         next(err)
      }
   }

   async removeExpense(req, res, next) {
      try {
         await expensesService.removeExpense(req.body.id)
         return res.sendStatus(200)
      } catch(err) {
         next(err)
      }
   }

   async setLimit(req, res, next) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
         }

         await expensesService.setLimit(req.user.id, req.body.sum)
         return res.sendStatus(200)
      } catch(err) {
         next(err)
      }
   }
}

export default new ExpensesController()