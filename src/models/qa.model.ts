import { Document, Schema, Types, model } from 'mongoose';

export interface IQA extends Document {
  courseDataId: Types.ObjectId;
  qaUser: Types.ObjectId;
  qaParent?: string;
  qaText: string;
  qaLevel: number;
  qaLeft: number;
  qaRight: number;
}

export const QASchema = new Schema<IQA>(
  {
    courseDataId: { type: Schema.Types.ObjectId, ref: 'LectureData', required: true },
    qaParent: { type: String },
    qaUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    qaText: { type: String, required: true },
    qaLevel: { type: Number, required: true },
    qaLeft: { type: Number, required: true },
    qaRight: { type: Number, required: true }
  },
  {
    timestamps: true,
    collection: 'qa'
  }
);

const QA = model<IQA>('QA', QASchema);

export default QA;
