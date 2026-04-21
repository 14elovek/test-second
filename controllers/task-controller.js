import taskService from '../service/task-service.js'

class TaskController{
   async getTasks(req, res, next) {
      try {
         const tasks = await taskService.getTasks(req.user.id)
         res.json(tasks)
      } catch(err) {
         next(err)
      }
   }

   async createTask(req, res, next) {
      try {
         const tasks = await taskService.createTask(req.user.id, req.body)
         res.json(tasks)
      } catch(err) {
         next(err)
      }
   }

   async changeCompleteTask(req, res, next) {
      await taskService.changeCompleteTask(req.body.taskId)
      return res.sendStatus(200)
   }

   async getCompletedTasks(req, res, next) {
      try {
         const tasks = await taskService.getCompletedTasks(req.user.id)
         res.json(tasks)
      } catch(err) {
         next(err)
      }
   }
   
   async getUncompletedTasks(req, res, next) {
      try {
         const tasks = await taskService.getUncompletedTasks(req.user.id)
         res.json(tasks)
      } catch(err) {
         next(err)
      }
   }
}

export default new TaskController()