import mailService from './mail-service.js'
import dotenv from 'dotenv'
dotenv.config()
import ApiError from '../exceptions/api-error.js'
import taskModel from '../models/taskModel.js'

class TaskService {
   async getTasks(userId) {
      return await taskModel.find({user: userId})
   }

   async createTask(userId, task) {
      if (!task.message || !task.header) {
         throw ApiError.BadRequest('Параметр не указан')
      }
      return await taskModel.create({header: task.header, message: task.message, user: userId})
   }

   async changeCompleteTask(taskId) {
      const task = await taskModel.findById(taskId)
      task.isComplete = !task.isComplete
      
      return await task.save()
   }

   async getCompletedTasks(userId) {
      return await taskModel.find({user: userId, isComplete: true})
   }

   async getUncompletedTasks(userId) {
      return await taskModel.find({user: userId, isComplete: false})
   }
}

export default new TaskService