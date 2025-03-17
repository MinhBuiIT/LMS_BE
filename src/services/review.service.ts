import { ObjectId, Types } from 'mongoose';
import { BadRequestResponse, NotFoundResponse } from '~/core/error.response';
import NotificationModel from '~/models/notification.model';
import { findCourseById } from '~/models/repository/course.repo';
import { findUserById } from '~/models/repository/user.repo';
import Review, { IReview } from '~/models/reviews.model';
import User, { IUser } from '~/models/user.model';

export const addReviewService = async (review: IReview, id: string) => {
  const course = await findCourseById(review.course.toString());
  const user = await findUserById(id);
  if (!course) {
    throw new NotFoundResponse('Course not found');
  }
  if (!user) {
    throw new NotFoundResponse('User not found');
  }
  if (review.comment.trim() === '') {
    throw new NotFoundResponse('Comment is required');
  }
  //Kiểm tra nếu user không mua khóa học thì không được comment
  if (!user.courses.some((c) => c.courseId.toString() === review.course.toString())) {
    throw new BadRequestResponse('You have not purchased this course');
  }

  //Kiểm tra user đã review thì không được review nữa
  const foundUserReview = await Review.findOne({ user: id, course: review.course });
  if (foundUserReview) {
    throw new BadRequestResponse('You have reviewed this course');
  }

  const newReview = await Review.create({
    user: id,
    course: review.course,
    rating: review.rating,
    comment: review.comment.trim(),
    replies: null
  });
  const newReviewConfig = {
    ...newReview.toJSON(),
    user: (await User.findById(newReview.user).select('name avatar role')) as IUser
  };
  const topReview = course.top_reviews;
  if (topReview.length < 5) {
    topReview.push(newReviewConfig);
  } else {
    const reviewLessRating = topReview.find((reviewTop) => {
      return review.rating > reviewTop.rating;
    });
    if (reviewLessRating) {
      //Nếu có review có rating nhỏ hơn review mới thì thay thế review đó bằng review mới
      const index = topReview.indexOf(reviewLessRating);
      topReview[index] = newReviewConfig;
    } else if (topReview.every((reviewTop) => reviewTop.rating === 5) && review.rating === 5) {
      //Nếu tất cả review đều có rating là 5 và review mới cũng có rating là 5 thì thay thế review cuối cùng bằng review mới
      topReview[topReview.length - 1] = newReviewConfig;
    }
  }
  //Cập nhật rating trung bình của course
  const averating = await Review.aggregate([
    {
      $match: {
        course: new Types.ObjectId(review.course as any)
      }
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' }
      }
    }
  ]);

  await course.updateOne({ top_reviews: topReview, rating: averating[0].average });

  //send notification
  await NotificationModel.create({
    userId: id,
    title: 'Review Course',
    message: `${user.name} has reviewd ${course.name} with rating ${review.rating}`
  });
  return newReviewConfig;
};

export const relyReviewService = async (reviewId: string, text: string, userId: string, courseId: string) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundResponse('Review not found');
  }
  const newRely = {
    text: text,
    user: userId
  };
  review.replies = newRely;
  await review.save();

  const course = await findCourseById(courseId);
  if (!course) {
    throw new NotFoundResponse('Course not found');
  }
  const findReview = course.top_reviews.find((reviewTop) => (reviewTop._id as ObjectId).toString() === reviewId);

  if (findReview) {
    findReview.replies = {
      text: text,
      user: await User.findById(userId).select('name avatar')
    };
    const topReviewNew = course.top_reviews.map((reviewTop) => {
      if ((reviewTop._id as ObjectId).toString() === reviewId) {
        return findReview;
      }
      return reviewTop;
    });

    await course.updateOne({ top_reviews: topReviewNew });
  }
  const user = await findUserById(userId);
  return {
    text: text,
    user: {
      _id: user?._id,
      name: user?.name,
      avatar: user?.avatar,
      role: user?.role
    }
  };
};

export const getAllReviewOfCourseService = async (courseId: string, limit: number, page: number) => {
  const reviews = await Review.find({ course: courseId })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name avatar')
    .populate('replies.user', 'name avatar');

  const countReviews = await Review.countDocuments({ course: courseId });
  return {
    reviews,
    total_review: countReviews,
    total_page: Math.ceil(countReviews / limit),
    current_page: page,
    limit
  };
};
