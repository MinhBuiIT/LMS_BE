import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import env from '~/config/env';
import { BadRequestResponse } from '~/core/error.response';
import { CreatedResponse, OKResponse } from '~/core/success.response';
import { redis } from '~/db/db.init';
import { ICourse } from '~/models/course.model';
import {
  addSectionCourseService,
  changeOrderLectureService,
  changeStatusCourseService,
  createCourse,
  deleteVideoCourseService,
  editCourse,
  editSectionService,
  getAllCourseService,
  getCourseDetailService,
  getCourseUserNotPurchaseService,
  getCourseUserPurchaseService,
  getListCoursePurchasedService,
  getListCourseService,
  TAddSection,
  TCreateCourseBody,
  TEditSection,
  TLectureChangeOrder,
  uploadVideoCourseService
} from '~/services/course.service';
import { getKeyObjectEmpty } from '~/utils';

export const createCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const { courseInfo } = req.body as TCreateCourseBody;

  const bodyConfig = {
    name: courseInfo?.name || null,
    description: courseInfo?.description || null,
    price: courseInfo?.price || null,
    thumbnail: courseInfo?.thumbnail || null,
    tags: courseInfo?.tags || null,
    level: courseInfo?.level || null,
    demoUrl: courseInfo?.demoUrl || null,
    category: courseInfo?.category || null
  };

  const keysEmpty = getKeyObjectEmpty(bodyConfig);
  if (Object.keys(keysEmpty).length > 0) {
    return next(new BadRequestResponse('Missing required fields', keysEmpty));
  }

  const newCourse = await createCourse(req.body as TCreateCourseBody);
  new CreatedResponse({ message: 'Course created', data: newCourse }).send(res);
};

export const editCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as ICourse;
  const id = req.params.id;
  if (!id || !isValidObjectId(id)) {
    return next(new BadRequestResponse('Invalid course id'));
  }

  //Cho phép cập nhật hết các trường trong course
  const bodyConfig = {
    name: body?.name || null,
    description: body?.description || null,
    price: body?.price || null,
    thumbnail: body?.thumbnail || null,
    tags: body?.tags || null,
    level: body?.level || null,
    demoUrl: body?.demoUrl || null,
    category: body?.category || null
  };
  const keysEmpty = getKeyObjectEmpty(bodyConfig);
  if (Object.keys(keysEmpty).length > 0) {
    return next(new BadRequestResponse('Missing required fields', keysEmpty));
  }
  const updatedCourse = await editCourse(id, req.body);
  await redis.del(`course-purchase-${id}`);
  await redis.del(`course-not-purchase-${id}`);
  new OKResponse({ message: 'Course updated', data: updatedCourse }).send(res);
};

export const editSectionCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as TEditSection;
  const sectionId = req.params.id;

  if (!sectionId || !isValidObjectId(sectionId)) {
    return next(new BadRequestResponse('Invalid section id'));
  }
  await editSectionService(sectionId, body);
  await redis.del(`course-purchase-${body.courseId}`);
  await redis.del(`course-not-purchase-${body.courseId}`);
  new OKResponse({ message: 'Edit section success', data: null }).send(res);
};

export const getCourseDetailController = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  if (!id || !isValidObjectId(id)) {
    return next(new BadRequestResponse('Invalid course id'));
  }
  const user = (req as any).user;

  const course = await getCourseDetailService(id);
  new OKResponse({ message: 'Get course detail successfully', data: course }).send(res);
};

//Get course by id for user not purchase
export const getCourseByIdUserNotPurchaseController = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  if (!id || !isValidObjectId(id)) {
    return next(new BadRequestResponse('Invalid course id'));
  }
  const courseRedis = await redis.get(`course-not-purchase-${id}`);
  if (courseRedis) {
    return new OKResponse({ message: 'Get basic course successfully', data: JSON.parse(courseRedis) }).send(res);
  }
  const course = await getCourseUserNotPurchaseService(id);
  await redis.set(`course-not-purchase-${id}`, JSON.stringify(course), 'EX', 10 * 60); // 10 minute
  return new OKResponse({ message: 'Get basic course successfully', data: course }).send(res);
};

//Get course by id for user purchase
export const getCourseByIdUserPurchaseController = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const id = req.params.id;
  if (!id || !isValidObjectId(id)) {
    return next(new BadRequestResponse('Invalid course id'));
  }
  if (user.role === 'user') {
    if (!user.courses.some((course: any) => course.courseId.toString() === id.toString())) {
      return next(new BadRequestResponse('User not purchase this course'));
    }
  }
  const courseRedis = await redis.get(`course-purchase-${id}`);
  if (courseRedis) {
    return new OKResponse({ message: 'Get basic course successfully', data: JSON.parse(courseRedis) }).send(res);
  }

  const course = await getCourseUserPurchaseService(id);
  await redis.set(`course-purchase-${id}`, JSON.stringify(course), 'EX', 10 * 60); // 10 minute

  return new OKResponse({ message: 'Get basic course successfully', data: course }).send(res);
};

export const getCourseListController = async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const page = query.page || 1;
  const limit = query.limit || 10;
  const category = query.cate || null;
  const search = query.search || null;

  const courseListRedis = await redis.get(`course-list-${page}-${limit}-${category}-${search}`);
  if (courseListRedis) {
    return new OKResponse({ message: 'Get course list successfully', data: JSON.parse(courseListRedis) }).send(res);
  }

  const courses = await getListCourseService(Number(page), Number(limit), category as string, search as string);
  await redis.set(`course-list-${page}-${limit}-${category}-${search}`, JSON.stringify(courses), 'EX', 60); // 1 minute

  return new OKResponse({ message: 'Get course list successfully', data: courses }).send(res);
};

export const getCourseListPurchasedController = async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const page = query.page || 1;
  const limit = query.limit || 10;
  const user = (req as any).user;

  const courses = await getListCoursePurchasedService({ page: Number(page), limit: Number(limit), user });
  return new OKResponse({ message: 'Get course list purchased successfully', data: courses }).send(res);
};

export const getAllCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.query;
  const courses = await getAllCourseService({ page: Number(page || 1), limit: Number(limit || 10) });
  new OKResponse({ message: 'Get all course successfully', data: courses }).send(res);
};

export const changeStatusCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  if (!id || !isValidObjectId(id)) {
    return next(new BadRequestResponse('Invalid course id'));
  }
  await changeStatusCourseService(id);
  new OKResponse({ message: 'Change Status Course Success', data: null }).send(res);
};

export const generateDataVideoCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const { videoId } = req.body;
  if (!videoId) {
    return next(new BadRequestResponse('Missing required fields'));
  }
  const response = await axios.post(
    `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
    {
      ttl: 300
    },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Apisecret ${env.VDOCIPHER_API_SECRET}`
      }
    }
  );

  new OKResponse({ message: 'Generate OTP Success', data: response.data }).send(res);
};

export const getInfoVideoCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const { videoId } = req.body;
  if (!videoId) {
    return next(new BadRequestResponse('Missing required fields'));
  }
  const response = await axios.get(`https://dev.vdocipher.com/api/videos/${videoId}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Apisecret ${env.VDOCIPHER_API_SECRET}`
    }
  });

  new OKResponse({ message: 'Get video info Success', data: response.data }).send(res);
};

export const uploadVideoCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const file = (req as any).file as Express.Multer.File;
  if (!file) {
    return next(new BadRequestResponse('File is required'));
  }
  const result = await uploadVideoCourseService(file);
  return new OKResponse({
    message: 'Upload video success',
    data: {
      videoUrl: result.secure_url,
      videoId: result.public_id,
      duration: result.duration,
      playBackUrl: result.playback_url
    }
  }).send(res);
};

export const deleteVideoCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const { public_id } = req.body;

  if (!public_id || public_id.length === 0) {
    return next(new BadRequestResponse('Missing required fields'));
  }
  await deleteVideoCourseService(public_id);
  return new OKResponse({ message: 'Delete video success', data: null }).send(res);
};

export const changeOrderLectureController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as TLectureChangeOrder & { courseId: string; sectionId: string };
  await changeOrderLectureService(body);
  await redis.del(`course-purchase-${body.courseId}`);
  await redis.del(`course-not-purchase-${body.courseId}`);
  return new OKResponse({ message: 'Change order lecture success', data: null }).send(res);
};

export const addSectionCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as TAddSection;
  const courseId = req.params.courseId;

  if (!courseId || !isValidObjectId(courseId)) {
    return next(new BadRequestResponse('Invalid course id'));
  }
  await addSectionCourseService(courseId, body);
  await redis.del(`course-purchase-${courseId}`);
  await redis.del(`course-not-purchase-${courseId}`);
  return new OKResponse({ message: 'Add section success', data: null }).send(res);
};
