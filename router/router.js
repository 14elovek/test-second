import { Router } from "express"
import controller from "../controllers/user-controller.js"
import {body} from 'express-validator'
import authMiddleware from "../middlewares/auth-middleware.js"

const router = new Router()

router.post('/registration',
   body('email').isEmail(),
   body('password').isLength({min: 3, max: 25}),
   controller.registration)
router.post('/login', controller.login)
router.post('/logout', controller.logout)
router.get('/activate/:link', controller.activate)
router.get('/refresh', controller.refresh)
router.get('/users', authMiddleware, controller.getUsers)

export default router