import { Document, model, Schema } from 'mongoose';
export interface ILink extends Document {
  url: string;
  title: string;
}

export interface ILecture extends Document {
  title: string;
  description: string;
  videoUrl: {
    url: string;
    public_id: string;
  };
  videoLength: number;
  videoOrder: number;
  links: ILink[];
}

const linkSchema = new Schema<ILink>({
  url: { type: String, required: true },
  title: { type: String, required: true }
});

const lectureSchema = new Schema<ILecture>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    },
    videoLength: { type: Number, required: true },
    videoOrder: { type: Number, required: true },
    links: {
      type: [linkSchema]
    }
  },
  {
    timestamps: true,
    collection: 'lectures'
  }
);

const LectureData = model<ILecture>('LectureData', lectureSchema);

export default LectureData;
