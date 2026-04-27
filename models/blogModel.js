import { Schema, model } from "mongoose";

const BlogSchema = new Schema({
   user: {type: Schema.Types.ObjectId, ref: 'User'},
})

export default model('Blog', BlogSchema)