import { Document, model, ObjectId, Schema } from 'mongoose';

export interface ISection extends Document {
  title: string;
  order: number;
  lectures: ObjectId[];
}

const sectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    order: { type: Number, required: true },
    lectures: { type: [Schema.Types.ObjectId], ref: 'LectureData', default: [] }
  },
  { timestamps: true, collection: 'sections' }
);

const Section = model<ISection>('Section', sectionSchema);
export default Section;
