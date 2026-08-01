import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from "dotenv"
dotenv.config()
import router from './router/router'
import mongoose from 'mongoose'
import errorMiddleware from './middlewares/error-middleware'

const LINK = process.env.MONGOOSE_LINK || 'mongodb://localhost:27017/'
const PORT = process.env.PORT || 5000
const app = express()

app.use(helmet())
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