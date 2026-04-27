import blogModel from '../models/blogModel.js'
import articleModel from '../models/articleModel.js'
import ApiError from '../exceptions/api-error.js'
import userModel from '../models/userModel.js'

class BlogService {
   async getBlogs() {
      const blogs = await blogModel.find({})
      return blogs
   }

   async getArticles(id) {
      const articles = await articleModel.find({blog: id})
      return articles
   }

   async getArticle(id) {
      const article = await articleModel.findById(id)
      return article
   }  

   async getBlog(id) {
      const blog = await articleModel.find({blog: id})
      return blog
   }  

   async addArticle(title, content, userId) {       
      if (!title || !content) throw ApiError.BadRequest('Поля должны содежать значения')

      const blog = await blogModel.findOne({user: userId})
      return await articleModel.create({
         user: userId,
         blog: blog._id.toString(),
         title,
         content,
         date: new Date()
      })
   }

   async removeArticle(articleId, userId) {         
      const article = await articleModel.findById(articleId)
      console.log(article.user.toString(), 231, userId)
      if (article.user.toString() !== userId) throw ApiError.Forbidden()

      return await articleModel.findByIdAndDelete(articleId)
   }


   async createBlog(userId) {         
      return await blogModel.create({user: userId})
   }
} 

export default new BlogService