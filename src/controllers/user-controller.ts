import userService from '../service/user-service'
import { Request, Response } from 'express'
import dotenv from 'dotenv'
dotenv.config()

interface AuthBody {
   email: string
   password: string
}

class UserController {
   async registration(req: Request<{},{},AuthBody,{}>, res: Response) {
      const { email, password } = req.body
      const userData = await userService.registration(email, password)
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
      
      res.json(userData)
   }

   async login(req: Request<{},{},AuthBody,{}>, res: Response) {
      const { email, password } = req.body
      const userData = await userService.login(email, password)
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
      
      res.json(userData)
   }

   async logout(req: Request, res: Response) {
      const {refreshToken} = req.cookies
      await userService.logout(refreshToken)
      res.clearCookie('refreshToken')
      res.sendStatus(200)
   }
   
   async refresh(req: Request, res: Response) {
      const {refreshToken} = req.cookies
      const userData = await userService.refresh(refreshToken)
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
      res.json(userData)
   }

   async activate(req: Request<{ link: string },{},{},{}>, res: Response) {
      const activationLink = req.params.link
      await userService.activate(activationLink)
      res.redirect(process.env.CLIENT_URL || 'http://localhost:5000')
   }

   async getUsers(req: Request, res: Response) {
      const users = await userService.getUsers()
      res.json(users)
   }
}

export default new UserController()