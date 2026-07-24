import { Schema, model, Types, Document } from "mongoose";

interface IUser extends Document {
   email: string
   password: string
   isActivated: boolean
   activationLink: string
}

const UserSchema = new Schema<IUser>({
   email: {type: String, required: true, unique: true},
   password: {type: String, required: true},
   isActivated: {type: Boolean, default: false},
   activationLink: {type: String}
})

export default model<IUser>('User', UserSchema)