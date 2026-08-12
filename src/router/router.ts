import { Router } from "express"
import controller from "../controllers/user-controller"
import authMiddleware from "../middlewares/auth-middleware"
import expensesController from '../controllers/expenses-controller'
import { validate } from '../middlewares/validate-middleware'
import userSchemas from '../schemas/user-schema'
import expenseSchemas from "../schemas/expense-schema"

const router = Router()

router.post('/registration', validate({body: userSchemas.registerBody}), controller.registration)
router.post('/login', validate({body: userSchemas.loginBody}), controller.login)
router.post('/logout', controller.logout)
router.get('/activate/:link', validate({params: userSchemas.activateParams}), controller.activate)
router.get('/refresh', controller.refresh)

router.post('/addExpense', authMiddleware, validate({body: expenseSchemas.addExpenseBody}), expensesController.addExpense)
router.patch('/updateExpense', authMiddleware, validate({body: expenseSchemas.updateExpenseBody}), expensesController.updateExpense)
// router.post('/setLimit', validateSum, authMiddleware, expensesController.setLimit)
router.delete('/expenses/:expenseId', authMiddleware, validate({params: expenseSchemas.deleteExpenseParams}), expensesController.removeExpense)
router.get('/expenses', authMiddleware, expensesController.getExpenses)
router.get('/expenses/search', authMiddleware, validate({query: expenseSchemas.getSortExpensesQuery}), expensesController.getSortExpenses)
router.get('/expenses/date', authMiddleware, validate({query: expenseSchemas.getExpensesForMonth}), expensesController.getExpensesForMonth)

export default router