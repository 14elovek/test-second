import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import router from './router/router'
import errorMiddleware from './middlewares/error-middleware'
import 'dotenv/config'

const app = express()

app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use('/api', router)
app.use(errorMiddleware)

export default app