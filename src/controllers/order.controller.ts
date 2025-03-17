import { NextFunction, Request, Response } from 'express';
import env from '~/config/env';
import { BadRequestResponse } from '~/core/error.response';
import { CreatedResponse, OKResponse } from '~/core/success.response';
import { redis } from '~/db/db.init';
import { IOrder } from '~/models/order.model';
import { createOrderService, getAllOrderService } from '~/services/order.service';
const stripe = require('stripe')(env.STRIPE.SECRET_KEY);

export const createOrderController = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId, paymentInfo, price } = req.body as Pick<IOrder, 'courseId' | 'paymentInfo' | 'price'>;
  // console.log('Create Order', req.body);

  if (!courseId) {
    return new BadRequestResponse('CourseId is required');
  }
  //   if (!paymentInfo) {
  //     return new BadRequestResponse('PaymentInfo is required');
  //   }
  const userId = (req as any).user._id;
  const data = await createOrderService({
    userId: userId,
    courseId: courseId.toString(),
    paymentInfo,
    price
  });
  const auth = JSON.parse((await redis.get(userId)) as string);

  auth.courses.push(data.course);

  await redis.set(userId, JSON.stringify(auth), 'EX', 7 * 24 * 60 * 60); //7 days

  new CreatedResponse({ message: 'Order created successfully', data }).send(res);
};

//For Admin
export const getAllOrderController = async (req: Request, res: Response) => {
  const orderList = await getAllOrderService();
  new OKResponse({ message: 'Get all order successfully', data: orderList }).send(res);
};

export const getPublishKeyStripeController = async (req: Request, res: Response) => {
  const publishKey = env.STRIPE.PUBLISH_KEY;
  new OKResponse({ message: 'Get publish key stripe successfully', data: { publishKey } }).send(res);
};

export const newPaymentStripeController = async (req: Request, res: Response) => {
  const { amount } = req.body as { amount: number };
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    metadata: {
      company: 'E-Learning'
    },
    automatic_payment_methods: {
      enabled: true
    }
  });

  new CreatedResponse({
    message: 'Create payment stripe successfully',
    data: {
      success: true,
      client_secret: paymentIntent.client_secret
    }
  }).send(res);
};
