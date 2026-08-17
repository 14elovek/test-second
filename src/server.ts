import mongoose from 'mongoose'
import app from "./app"
import 'dotenv/config'
import { logger } from './utils/logger'

const LINK = process.env.MONGOOSE_LINK || 'mongodb://localhost:27017/'
const PORT = process.env.PORT || 5000

const start = async () => {
   try {
      logger.info('Подключение к базе данных...')
      await mongoose.connect(LINK)
      
      app.listen(PORT, () => {
         logger.info(`Сервер успешно запущен на порту ${process.env.PORT}`)
      })
   } catch (err) {
      logger.fatal(err, 'Ошибка при запуске приложения')
      process.exit(1)
   }
}
start()