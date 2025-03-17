import { Document, ObjectId, Schema, model } from 'mongoose';

export interface IOrder extends Document {
  userId: ObjectId;
  courseId: ObjectId;
  price: number;
  paymentInfo: Object;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    price: { type: Number, required: true },
    paymentInfo: { type: Object, default: {} }
  },
  { timestamps: true, collection: 'orders' }
);

const OrderModel = model<IOrder>('Order', orderSchema);

export default OrderModel;
