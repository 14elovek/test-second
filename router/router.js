import { Router } from "express"
import controller from "../controllers/user-controller.js"
import {body} from 'express-validator'
import authMiddleware from "../middlewares/auth-middleware.js"
import expensesController from '../controllers/expenses-controller.js'
const router = new Router()

router.post('/registration',
   body('email').isEmail(),
   body('password').isLength({min: 3, max: 25}),
   controller.registration)
router.post('/login', controller.login)
router.post('/logout', controller.logout)
router.get('/activate/:link', controller.activate)
router.get('/refresh', controller.refresh)

router.post('/addExpense',
   body('sum').custom(value => {
      if (value > 0 && typeof value === 'number') return true
      else return false
   }),
   authMiddleware, expensesController.addExpense)
router.post('/updateExpense',
   body('sum').custom(value => {
      if (value > 0 && typeof value === 'number') return true
      else return false
   }),
   authMiddleware, expensesController.updateExpense)
router.post('/setLimit',
   body('sum').custom(value => {
      if (value > 0 && typeof value === 'number') return true
      else return false
   }),
   authMiddleware, expensesController.setLimit)
router.get('/expenses', authMiddleware, expensesController.getExpenses)
router.get('/expenses', authMiddleware, expensesController.getExpenses)
router.get('/expensesForMonth', authMiddleware, expensesController.getExpensesForMonth)

export default router