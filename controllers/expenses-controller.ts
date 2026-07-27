import { Request, Response } from 'express'
import { checkAuth } from '../utils/check-auth'
import expensesService from '../service/expenses-service'
import { validationResult } from 'express-validator'
import ApiError from '../exceptions/api-error'
import dotenv from 'dotenv'
dotenv.config()

interface AddExpenseBody {
   sum: number
   title: string
   category: string
}
interface UpdateExpenseBody {
   expenseId: string
   sum: number
   title: string
   category: string
}

class ExpensesController {
   async getExpenses(req: Request, res: Response) {
      checkAuth(req)

      const expenses = await expensesService.getExpenses(req.user.id)
      res.json(expenses)
   }

   async getSortExpenses(
      req: Request<{},{},{},{ dateFrom: string, dateTo: string }>,
      res: Response) {
         checkAuth(req)

         const {dateFrom, dateTo} = req.query
            
         const expenses = await expensesService.getSortExpenses(dateFrom, dateTo, req.user.id)
         res.json(expenses)
   }

   async addExpense(req: Request<{},{},AddExpenseBody,{}>, res: Response) {
      checkAuth(req)

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
         throw ApiError.BadRequest('Ошибка при валидации', errors.array())
      }

      const { sum, title, category } = req.body
      await expensesService.addExpense(req.user.id, sum, title, category)
      res.status(200).json({ success: true })
   }

   async updateExpense(req: Request<{},{},UpdateExpenseBody,{}>, res: Response) {
      checkAuth(req)

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
         throw ApiError.BadRequest('Ошибка при валидации', errors.array())
      }

      const { expenseId, sum, title, category } = req.body
      await expensesService.updateExpense(req.user.id, expenseId, sum, title, category)
      res.status(200).json({ success: true })
   }

   async getExpensesForMonth(req: Request<{},{},{},{ month: string }>, res: Response) {
      checkAuth(req)

      const { month } = req.query

      if (!month) throw ApiError.BadRequest('Не указан месяц')

      const expenses = await expensesService.getExpensesForMonth(req.user.id, month )
      res.json(expenses)
   }

   async removeExpense(req: Request<{},{},{},{ expenseId: string }>, res: Response) {
      checkAuth(req)

      const { expenseId } = req.query
      await expensesService.removeExpense(expenseId, req.user.id)
      res.status(200).json({ success: true })
   }

   // async setLimit(req: Request<{},{},{ sum: string },{}>, res: Response) {
   //    checkAuth(req)

   //    const errors = validationResult(req)
   //    if (!errors.isEmpty()) {
   //       throw ApiError.BadRequest('Ошибка при валидации', errors.array())
   //    }

   //    const { sum } = req.body
   //    await expensesService.setLimit(req.user.id, sum)
   //    res.status(200).json({ success: true })
   // }
}

export default new ExpensesController()