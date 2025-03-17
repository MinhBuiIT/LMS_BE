import { Document, model, Schema } from 'mongoose';

export interface IBannerImage extends Document {
  public_id: string;
  url: string;
}

export interface ICategory extends Document {
  name: string;
}

export interface IFaq extends Document {
  question: string;
  answer: string;
}

export interface ILayout extends Document {
  type: string;
  banner?: {
    title: string;
    subTitle: string;
    image: IBannerImage;
  };
  categories?: ICategory[];
  faqs?: IFaq[];
}

export const bannerImageSchema = new Schema<IBannerImage>({
  public_id: { type: String },
  url: { type: String }
});

export const categorySchema = new Schema<ICategory>({
  name: { type: String }
});

export const faqSchema = new Schema<IFaq>({
  question: { type: String },
  answer: { type: String }
});

export const layoutSchema = new Schema<ILayout>(
  {
    type: { type: String, required: true, enum: ['banner', 'category', 'faq'] },
    banner: {
      title: { type: String },
      subTitle: { type: String },
      image: bannerImageSchema
    },
    categories: [categorySchema]
    // faqs: [faqSchema]
  },
  {
    timestamps: true,
    collection: 'layouts'
  }
);

export const LayoutModel = model<ILayout>('layouts', layoutSchema);
