import { Schema, model} from 'mongoose'

const TaskModel = new Schema({
   header: {type: String, required: true},
   message: {type: String, required: true},
   isComplete: {type: Boolean, default: false},
   user: {type: Schema.Types.ObjectId, ref: 'User'},
})

export default model('Task', TaskModel)