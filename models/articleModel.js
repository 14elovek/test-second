import { Schema, model } from "mongoose";

const ArticleSchema = new Schema({
   user: {type: Schema.Types.ObjectId, ref: 'User'},
   blog: {type: Schema.Types.ObjectId, ref: 'Blog'},
   title: {type: String, required: true},
   content: {type: String, required: true},
   date: {type: Date, require: true},
})

export default model('Article', ArticleSchema)