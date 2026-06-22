import expenseModel from '../models/expenseModel.js'
import ApiError from '../exceptions/api-error.js'

class ExpensesService {
   async addExpense(userId, sum, title, category) {
      if (!sum || !title) {
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

   async getExpenses(userId) {
      const expenses = await expenseModel.find({user: userId})
      return expenses
   }

   async getSortExpenses(dateFrom, dateTo, userId) {
      const expenses = await expenseModel.find({date: {$gte: new Date(dateFrom), $lte: new Date(dateTo)}, user: userId})
      return expenses
   }

   async updateExpense(userId, expenseId, sum, title, category) {
      if (!sum && !title && !category) throw ApiError.BadRequest('Не указаны значения')

      const expense = await expenseModel.findById(expenseId)
      if (expense.user != userId) throw ApiError.Forbidden()

      if (sum) expense.sum = sum
      if (title) expense.title = title
      if (category) expense.category = category

      return await expense.save()
   }

   async getExpensesForMonth(userId, month) {
      if (!month) throw ApiError.BadRequest('Не указан месяц')

      const [year, monthNumber] = month.split('.')
      const dateFrom = new Date(Date.UTC(year, monthNumber - 1, 1))
      const dateTo = new Date(Date.UTC(year, monthNumber, 1))
      console.log(dateFrom.toISOString() + " ==== " + dateTo.toISOString());

      const expenses = await expenseModel.find({date: {$gte: dateFrom, $lt: dateTo}, user: userId})

      let sum = 0
      for (const expense of expenses) {
         sum += expense.sum
      }

      return { expenses, sum }
   }

   async removeExpense(expenseId) {
      if (!expenseId) throw ApiError.BadRequest('Не указан id')

      const deletedExpense = await expenseModel.findByIdAndDelete(expenseId)
      if (!deletedExpense) throw ApiError.BadRequest('Расход не найден')

      return
   }

   async setLimit(userId, sum) {
      const monthlyExpenses = await monthlyExpensesModel.findOne({user: userId})
      if (!monthlyExpenses) throw ApiError.BadRequest('Лимит не найден')

      monthlyExpenses.limit = sum
      return await monthlyExpenses.save()
   }
} 

export default new ExpensesService