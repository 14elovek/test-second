import expenseModel from '../models/expenseModel'
import ApiError from '../exceptions/api-error'

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

   async getExpenses(userId: string) {
      return await expenseModel.find({user: userId})
   }

   async getSortExpenses(dateFrom: string, dateTo: string, userId: string) {
      return await expenseModel.find({
         date: {$gte: new Date(dateFrom),
         $lte: new Date(dateTo)},
         user: userId
      })
   }

   async updateExpense(
      userId: string,
      expenseId: string, 
      sum?: number,
      title?: string,
      category?: string) {
         const expense: any = await expenseModel.findById(expenseId)
         if (expense.user != userId) throw ApiError.Forbidden()

         if (sum !== undefined) expense.sum = sum
         if (title !== undefined) expense.title = title
         if (category !== undefined) expense.category = category

         console.log(123)
         return await expense.save()
   }

   async getExpensesForMonth(userId: string, month: string) {
      if (!month) throw ApiError.BadRequest('Не указан месяц')

      const [yearStr, monthStr] = month.split('.')

      const dateFrom = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, 1))
      const dateTo = new Date(Date.UTC(Number(yearStr), Number(monthStr), 1))

      const expenses = await expenseModel.find({date: {$gte: dateFrom, $lt: dateTo}, user: userId})

      let sum = 0
      for (const expense of expenses) {
         sum += expense.sum
      }

      return { expenses, sum }
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