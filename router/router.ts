import { Router } from "express"
import controller from "../controllers/user-controller"
import {body} from 'express-validator'
import authMiddleware from "../middlewares/auth-middleware"
import expensesController from '../controllers/expenses-controller'

const router = Router()

const validateSum = body('sum').custom((value: unknown): boolean => {
   if (typeof value === 'number' && value > 0) return true
   throw new Error('Invalid sum')
})

router.post('/registration',
   body('email').isEmail(),
   body('password').isLength({min: 3, max: 25}),
   controller.registration)
router.post('/login', controller.login)
router.post('/logout', controller.logout)
router.get('/activate/:link', controller.activate)
router.get('/refresh', controller.refresh)

router.post('/addExpense', validateSum, authMiddleware, expensesController.addExpense)
router.post('/updateExpense', validateSum,authMiddleware, expensesController.updateExpense)
// router.post('/setLimit', validateSum, authMiddleware, expensesController.setLimit)

router.delete('/expenses', authMiddleware, expensesController.removeExpense)
router.get('/expenses', authMiddleware, expensesController.getExpenses)
router.get('/expenses/search', authMiddleware, expensesController.getSortExpenses)
router.get('/expenses/month', authMiddleware, expensesController.getExpensesForMonth)

export default router