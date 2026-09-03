import expenseModel from '../models/expenseModel'
import ApiError from '../exceptions/api-error'
import { Types } from 'mongoose'
import { paginate } from '../utils/paginate'

class ExpensesService {
   async addExpense(userId: string, sum: number, title: string, category?: string) {
      if (sum === undefined || title === undefined) {
         throw ApiError.BadRequest('Не указано')
      }

      const date = new Date()

      return await expenseModel.create({
         user: userId,
         sum,
         title,
         date,
         category
      })
   }

   async getExpenses(page: number, limit: number, userId: string) {
      const result =  await paginate(
         expenseModel,
         { user: userId },
         { page, limit, sort: { date: -1 }}
      )

      return { expenses: result.data, meta: result.meta}
   }

   async getSortExpenses(
      dateFrom: string,
      dateTo: string,
      page: number,
      limit: number,
      userId: string
   ) {
      const filter = {
         date: {$gte: new Date(dateFrom), $lte: new Date(dateTo)},
         user: userId
      }

      const result =  await paginate(expenseModel, filter, { page, limit, sort: { date: -1 }})

      return { expenses: result.data, meta: result.meta}
   }

   async updateExpense(
      userId: string,
      expenseId: string, 
      sum?: number,
      title?: string,
      category?: string
   ) {
      const expense: any = await expenseModel.findById(expenseId)

      if (!expense) throw ApiError.BadRequest('Расход с таким ID не найден'); 
      if (expense.user.toString() != userId) throw ApiError.Forbidden()

      if (sum !== undefined) expense.sum = sum
      if (title !== undefined) expense.title = title
      if (category !== undefined) expense.category = category

      return await expense.save()
   }

   async getExpensesForMonth(fullDateStr: string, page: number, limit: number, userId: string) {
      const date = new Date(fullDateStr)
  
      const year = date.getUTCFullYear()
      const month = date.getUTCMonth();

      const dateFrom = new Date(Date.UTC(year, month, 1));
      const dateTo = new Date(Date.UTC(year, month + 1, 1));
      const filter = {date: {$gte: dateFrom, $lt: dateTo}, user: new Types.ObjectId(userId)}

      const [result, aggregationResult] = await Promise.all([
         paginate(expenseModel, filter, {page, limit, sort: { date: -1 }}),
         expenseModel.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: "$sum" }}}
         ])
      ])

      const totalSum = aggregationResult[0]?.total
      console.log(totalSum)
      return { expenses: result.data, meta: result.meta, totalSum }
   }

   async removeExpense(expenseId: string, userId: string) {
      const expense = await expenseModel.findById(expenseId)

      if (!expense) throw ApiError.BadRequest('Расход не найден')
      if (expense.user.toString() != userId) throw ApiError.Forbidden()

      return await expenseModel.findByIdAndDelete(expenseId) 
   }

   // async setLimit(userId: string, sum: number) {
   //    const monthlyExpenses = await monthlyExpensesModel.findOne({user: userId})
   //    if (!monthlyExpenses) throw ApiError.BadRequest('Лимит не найден')

   //    monthlyExpenses.limit = sum
   //    return await monthlyExpenses.save()
   // }
}

export default new ExpensesService