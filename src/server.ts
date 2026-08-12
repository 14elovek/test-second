import mongoose from 'mongoose'
import app from "./app"
import 'dotenv/config'

const LINK = process.env.MONGOOSE_LINK || 'mongodb://localhost:27017/'
const PORT = process.env.PORT || 5000

const start = async() => {
   try {
      await mongoose.connect(LINK)
      app.listen(PORT, () => console.log(`server started on PORT = ${PORT}`))
   } catch(err) {
      console.log(err)
   }
}
start()