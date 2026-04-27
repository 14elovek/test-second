import dotenv from 'dotenv'
dotenv.config()
import blogService from '../service/blog-service.js'
import { validationResult } from 'express-validator'
import ApiError from '../exceptions/api-error.js'

class BlogController {
   async getBlogs(req, res, next) {
      try {
         const blogs = await blogService.getBlogs()
         return res.json(blogs)
      } catch(err) {
         next(err)
      }
   }

   async getArticles(req, res, next) {
      try {
         const blogId = req.params.blog
         const articles = await blogService.getArticles(blogId)
         return res.json(articles)
      } catch(err) {
         next(err)
      }
   }

   async getArticle(req, res, next) {
      try {
         const articleId = req.params.article
         const article = await blogService.getArticle(articleId)
         return res.json(article)
      } catch(err) {
         next(err)
      }
   }

      async getBlog(req, res, next) {
      try {
         const blogId = req.params.blog
         const blog = await blogService.getBlog(blogId)
         return res.json(blog)
      } catch(err) {
         next(err)
      }
   }

   async addArticle(req, res, next) {
      try {
         const { title, content } = req.body
         const userId = req.user.id
         await blogService.addArticle(title, content, userId)
         return res.sendStatus(200)
      } catch(err) {
         next(err)
      }
   }

   async removeArticle(req, res, next) {
      try {
         await blogService.removeArticle(req.body.articleId, req.user.id)
         return res.sendStatus(200)
      } catch(err) {
         next(err)
      }
   }
}

export default new BlogController