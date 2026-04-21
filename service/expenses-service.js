import expenseModel from '../models/expenseModel.js'
import monthlyExpensesModel from '../models/monthlyExpensesModel.js'
import ApiError from '../exceptions/api-error.js'

class ExpensesService {
   async addExpense(userId, sum, title, category) {
      if (!sum || !title) {
         throw ApiError.BadRequest('Не указано')
      }

      const date = new Date()
      let monthlyExpenses = await monthlyExpensesModel.findOne({user: userId, date: `${date.getFullYear()}.${date.getMonth()}`})
      if (!monthlyExpenses) {
         monthlyExpenses = await monthlyExpensesModel.create({user: userId, date: `${date.getFullYear()}.${date.getMonth()}`, sum})
      } else {
         monthlyExpenses.sum += sum
         await monthlyExpenses.save()
      }
      
      return await expenseModel.create({
         user: userId,
         monthlyExpenses: monthlyExpenses._id,
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

   async updateExpense(userId, sum, title, category) {
      if (!sum && !title && !category) throw ApiError.BadRequest('Не указаны значения')

      const monthExpenses = await monthlyExpensesModel.findOne({user: userId})
      const expense = await expenseModel.findOne({user: userId})

      if (sum) {
         if (expense.sum > sum) monthExpenses.sum -= Math.abs(expense.sum - sum)
         if (expense.sum < sum) monthExpenses.sum += Math.abs(expense.sum - sum)
         await monthExpenses.save()

         expense.sum = sum
      }
      if (title) expense.title = title
      if (category) expense.category = category

      return await expense.save()
   }

   
   async getExpensesForMonth(userId) {
      const expenses = await monthlyExpensesModel.find({user: userId})
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