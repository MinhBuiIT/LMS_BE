import env from '~/config/env';
import { BadRequestResponse, NotFoundResponse } from '~/core/error.response';
import { sendMailWithHtml } from '~/mailtrap/sendMail';
import { ORDER_CONFIRMATION_TEMPLATE } from '~/mailtrap/templates';
import Course from '~/models/course.model';
import NotificationModel from '~/models/notification.model';
import OrderModel from '~/models/order.model';
import { findCourseById } from '~/models/repository/course.repo';
import { findUserById } from '~/models/repository/user.repo';
import User from '~/models/user.model';
const stripe = require('stripe')(env.STRIPE.SECRET_KEY);

type CreateOrderType = {
  userId: string;
  courseId: string;
  paymentInfo: Object;
  price: number;
};
export const createOrderService = async ({ userId, courseId, paymentInfo, price }: CreateOrderType) => {
  const foundCourse = await findCourseById(courseId);
  if (!foundCourse) {
    throw new NotFoundResponse('Course not found');
  }
  if (!foundCourse.isActive) {
    throw new BadRequestResponse('Course is not active');
  }
  const user = await findUserById(userId);
  if (!user) {
    throw new NotFoundResponse('User not found');
  }
  const checkCoursePurchases = user.courses.some((course) => course.courseId.toString() === courseId);
  if (checkCoursePurchases) {
    throw new BadRequestResponse('User already purchased this course');
  }

  if (paymentInfo) {
    if ('id' in paymentInfo) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentInfo.id);
      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestResponse('Payment not success');
      }
    } else {
      throw new BadRequestResponse('Payment not success');
    }
  } else {
    throw new BadRequestResponse('Payment not success');
  }

  // send email
  const html = ORDER_CONFIRMATION_TEMPLATE.replace('{courseName}', foundCourse.name)
    .replace('{amount}', price.toString() + '$')
    .replace('{username}', user.name)
    .replace('{date}', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  await sendMailWithHtml({
    recipients: [{ email: user.email }],
    subject: 'Order Confirmation',
    html,
    category: 'email-verification'
  });
  // send notification
  await NotificationModel.create({
    userId,
    title: 'Order Confirmation',
    message: `${user.name} have successfully ordered the course ${foundCourse.name}`
  });
  // create order
  const newOrder = await OrderModel.create({
    userId,
    courseId,
    paymentInfo,
    price
  });
  const userUpdate = await User.findOneAndUpdate(
    { _id: user._id },
    { $push: { courses: { courseId } } },
    { new: true }
  );
  if (userUpdate === null) {
    throw new BadRequestResponse('User not found');
  }

  const courseUpdate = userUpdate.courses.find((course: any) => course.courseId.toString() === courseId);
  //Tăng purchase Course lên 1
  await Course.findOneAndUpdate({ _id: courseId }, { $inc: { purchased: 1 } });
  return {
    newOrder,
    course: courseUpdate
  };
};

//For Admin
export const getAllOrderService = async () => {
  const orderList = await OrderModel.aggregate([
    {
      $sort: { createdAt: -1 }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $project: {
        _id: 1,
        course: { name: 1, price: 1, description: 1 },
        user: { name: 1, email: 1, avatar: 1 },
        paymentInfo: 1,
        createdAt: 1,
        price: 1
      }
    }
  ]);
  return orderList.map((order) => ({
    ...order,
    course: order.course[0],
    user: order.user[0]
  }));
};
