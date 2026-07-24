import { Response } from 'express'
import { AuthenticatedRequest } from '../interfaces/request-interface.js'
import expensesService from '../service/expenses-service.js'
import { validationResult } from 'express-validator'
import ApiError from '../exceptions/api-error.js'
import dotenv from 'dotenv'
dotenv.config()

interface AddExpenseBody {
   sum?: string
   title?: string
   category?: string
}
interface UpdateExpenseBody {
   expenseId: string
   sum: string
   title?: string
   category?: string
}

class ExpensesController {
   async getExpenses(req: AuthenticatedRequest, res: Response) {
      const expenses = await expensesService.getExpenses(req.user.id)
      res.json(expenses)
   }

   async getSortExpenses(req: AuthenticatedRequest, res: Response) {
      const {dateFrom, dateTo} = req.query as { dateFrom?: string, dateTo?: string }

      if (!dateFrom || !dateTo) throw ApiError.BadRequest('Не указаны даты')
         
      const expenses = await expensesService.getSortExpenses(dateFrom, dateTo, req.user.id)
      res.json(expenses)
   }

   async addExpense(req: AuthenticatedRequest, res: Response) {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
         throw ApiError.BadRequest('Ошибка при валидации', errors.array())
      }

      const { sum, title, category } = req.body as AddExpenseBody
      await expensesService.addExpense(req.user.id, sum, title, category)
      res.status(200).json({ success: true })
   }

   async updateExpense(req: AuthenticatedRequest, res: Response) {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
         throw ApiError.BadRequest('Ошибка при валидации', errors.array())
      }

      const { expenseId, sum, title, category } = req.body as UpdateExpenseBody
      await expensesService.updateExpense(req.user.id, expenseId, sum, title, category)
      res.status(200).json({ success: true })
   }

   async getExpensesForMonth(req: AuthenticatedRequest, res: Response) {
      const { month } = req.query as { month?: string }

      if (!month) throw ApiError.BadRequest('Не указан месяц')

      const expenses = await expensesService.getExpensesForMonth(req.user.id, month )
      res.json(expenses)
   }

   async removeExpense(req: AuthenticatedRequest, res: Response) {
      const { expenseId } = req.query as { expenseId?: string }
      await expensesService.removeExpense(expenseId)
      res.status(200).json({ success: true })
   }

   async setLimit(req: AuthenticatedRequest, res: Response) {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
         throw ApiError.BadRequest('Ошибка при валидации', errors.array())
      }

      const { sum } = req.body as { sum?: string }
      await expensesService.setLimit(req.user.id, sum)
      res.status(200).json({ success: true })
   }
}

export default new ExpensesController()