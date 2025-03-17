import { Document, ObjectId, Schema, model } from 'mongoose';
import { IUser } from './user.model';

export interface IReview extends Document {
  user: ObjectId | IUser;
  course: ObjectId;
  rating: number;
  comment: string;
  replies: Object;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    replies: {
      text: { type: String },
      user: { type: Schema.Types.ObjectId, ref: 'User' }
    }
  },
  { timestamps: true }
);

const Review = model<IReview>('Review', reviewSchema);
export default Review;
