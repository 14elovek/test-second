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
      console.log(userId + "   ====   " + expense.user)
      if (expense.user != userId) throw ApiError.Forbidden()

      if (sum) expense.sum = sum
      if (title) expense.title = title
      if (category) expense.category = category

      return await expense.save()
   }

   async getExpensesForMonth(userId, month) {
      const dateFrom = new Date(`${month}-01T00:00:00.000Z`)
      const dateTo = new Date(`${month}-01T00:00:00.000Z`)
      dateTo.setUTCMonth(dateTo.getUTCMonth() + 1)

      const expenses = await expenseModel.find({date: {$gte: dateFrom, $lt: dateTo}, user: userId})
      const result = await expenseModel.aggregate([
         { match: {date: {$gte: dateFrom, $lt: dateTo}, user: userId}},
         { group: { _id: "sum", total: { $sum: 1}}}
      ])

      return expenses
   }

   async removeExpense(expenseId) {
      const deletedExpense = await expenseModel.findByIdAndDelete(expenseId)
      if (!deletedExpense) throw ApiError.BadRequest()

      const expenses = await expenseModel.find({monthlyExpenses: deletedExpense.monthlyExpenses})

      if (expenses.length === 0) {
         await monthlyExpensesModel.findByIdAndDelete(deletedExpense.monthlyExpenses)
      } else {
         const monthlyExpenses = await monthlyExpensesModel.findById(deletedExpense.monthlyExpenses)
         monthlyExpenses.sum -= deletedExpense.sum
         await monthlyExpenses.save()
      }

      return
   }

   async setLimit(userId, sum) {
      const monthlyExpenses = await monthlyExpensesModel.findOne({user: userId})
      if (!monthlyExpenses) throw ApiError.BadRequest()

      monthlyExpenses.limit = sum
      return await monthlyExpenses.save()
   }
} 

export default new ExpensesService