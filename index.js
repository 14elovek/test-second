import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from "dotenv"
dotenv.config()
import router from './router/router.js'
import mongoose from 'mongoose'
import errorMiddleware from './middlewares/error-middleware.js'

const LINK = process.env.MONGOOSE_LINK
const PORT = process.env.PORT
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use('/api', router)
app.use(errorMiddleware)

const start = async() => {
   try {
      mongoose.connect(LINK)
      app.listen(PORT, () => console.log(`server started on PORT = ${PORT}`))
   } catch(err) {
      console.log(err)
   }
}
start()