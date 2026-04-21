import { Router } from "express"
import userController from "../controllers/user-controller.js"
import taskController from "../controllers/task-controller.js"
import {body} from 'express-validator'
import authMiddleware from "../middlewares/auth-middleware.js"

const router = new Router()

router.post('/registration',
   body('email').isEmail(),
   body('password').isLength({min: 3, max: 25}),
   userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)

router.post('/createTask', authMiddleware, taskController.createTask)
router.post('/changeCompleteTask', taskController.changeCompleteTask)
router.get('/completedTasks', authMiddleware, taskController.getCompletedTasks)
router.get('/uncompletedTasks', authMiddleware, taskController.getUncompletedTasks)
router.get('/tasks', authMiddleware, taskController.getTasks)

export default router