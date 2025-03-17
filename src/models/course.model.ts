import { Document, model, ObjectId, Schema } from 'mongoose';
import { IReview } from './reviews.model';

export interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: string;
  category: string;
  tags: string[];
  level: string;
  demoUrl: {
    url: string;
    public_id: string;
  };
  sections: ObjectId[];
  benifits: { title: string }[];
  prerequisites: { title: string }[];
  top_reviews: IReview[];
  rating?: number;
  purchased?: number;
  isActive: boolean;
}

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedPrice: { type: Number },
    thumbnail: {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    },
    category: { type: String, required: true },
    tags: { type: [String], required: true },
    level: { type: String, required: true },
    demoUrl: {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    },
    sections: { type: [Schema.Types.ObjectId], ref: 'Section', default: [] },
    benifits: { type: [{ title: String }], required: true, default: [] },
    prerequisites: { type: [{ title: String }], required: true, default: [] },
    top_reviews: { type: [Object], required: true, default: [] },
    rating: { type: Number, default: 0 },
    purchased: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'courses' }
);

const Course = model<ICourse>('Course', courseSchema);

export default Course;
