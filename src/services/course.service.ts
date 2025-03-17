import { UploadApiResponse } from 'cloudinary';
import { ObjectId } from 'mongoose';
import streamifier from 'streamifier';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '~/config/cloudinary';
import { BadRequestResponse, NotFoundResponse } from '~/core/error.response';
import Course, { ICourse } from '~/models/course.model';
import LectureData, { ILecture } from '~/models/lectures.model';
import { findAllCoursePaginate, getCourseDetail, getCourseList } from '~/models/repository/course.repo';
import Review from '~/models/reviews.model';
import Section from '~/models/sections.model';
import { IUser } from '~/models/user.model';

export type TCreateCourseBody = {
  courseInfo: ICourse;
  courseData: {
    title: string;
    order: number;
    lectures: ILecture[];
  }[];
};

export type TAddSection = {
  title: string;
  order: number;
  lectures: ILecture[];
};

export type TLectureChangeOrder = {
  lectureOriginal: { id: string; order: number };
  lectureTarget: { id: string; order: number };
};
export type TEditSection = {
  courseId: string;
  title: string;
  lectures: ILecture[];
};

export const createCourse = async (body: TCreateCourseBody) => {
  //Insert lecture & section -> Lấy ra id của section
  const sectionIds = await Promise.all(
    body.courseData.map(async (item) => {
      const lectures = await LectureData.insertMany(item.lectures);
      const lectureIds = lectures.map((lecture) => lecture._id);
      const newSection = await Section.create({
        title: item.title,
        order: item.order,
        lectures: lectureIds
      });

      return newSection._id;
    })
  );

  //console.log('sectionIds:::', sectionIds);

  //Create course
  const bodyCourse = {
    ...body.courseInfo,
    sections: sectionIds
  };

  const result = await cloudinary.uploader.upload(bodyCourse.thumbnail, {
    folder: 'lms/courses'
  });
  const newCourse = new Course({
    ...bodyCourse,
    thumbnail: {
      url: result.secure_url,
      public_id: result.public_id
    }
  });
  return newCourse.save();
};

export const editCourse = async (id: string, body: ICourse) => {
  const course = await Course.findById(id);
  if (!course) {
    throw new NotFoundResponse('Course not found');
  }
  if (!course.isActive) {
    throw new BadRequestResponse('Course is not active');
  }

  let result = null;
  if (body.thumbnail && !body.thumbnail.includes('https')) {
    await cloudinary.uploader.destroy((course.thumbnail as any).public_id);
    result = await cloudinary.uploader.upload(body.thumbnail, {
      folder: 'lms/courses'
    });
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    id,
    {
      ...body,
      thumbnail: result
        ? {
            url: result.secure_url,
            public_id: result.public_id
          }
        : {
            url: (course.thumbnail as any).url,
            public_id: (course.thumbnail as any).public_id
          }
    },
    { new: true }
  );

  return updatedCourse;
};

export const editSectionService = async (id: string, body: TEditSection) => {
  //Kiểm tra section có tồn tại không
  const section = await Section.findById(id);
  if (!section) {
    throw new NotFoundResponse('Section not found');
  }

  //Delete lecture not in body -> Khi edit section, nếu lecture không nằm trong body thì xóa
  const lecturesIdString = body.lectures.map((lecture) => lecture._id);
  const lectureDeletes = section.lectures.filter((lecture) => !lecturesIdString.includes(lecture.toString()));

  const foundLecturesDelete = await LectureData.find({ _id: { $in: lectureDeletes } });
  //Xóa video trên cloudinary chạy ngầm
  Promise.all(
    foundLecturesDelete.map(async (item) => {
      await cloudinary.uploader.destroy(item.videoUrl.public_id);
    })
  );

  await LectureData.deleteMany({ _id: { $in: lectureDeletes } });

  //Update lecture nếu không tồn tại _id -> insert, tồn tại _id -> update (yêu cầu tạo _id ở client)
  const result = await Promise.all(
    body.lectures.map(async (item) => {
      return await LectureData.findByIdAndUpdate(item._id, item, { new: true, upsert: true });
    })
  );

  section.title = body.title;
  section.lectures = result.map((item) => item._id) as any;
  await section.save();
};

export const getCourseDetailService = async (id: string) => {
  const course = await getCourseDetail(id);
  if (!course) {
    throw new NotFoundResponse('Course not found');
  }
  return course[0];
};

//Get course by id for user not purchase
export const getCourseUserNotPurchaseService = async (id: string) => {
  const course = await getCourseDetail(id, {
    $project: {
      'lectures.links': 0,
      'lectures.videoUrl': 0,
      'lectures.createdAt': 0,
      'lectures.updatedAt': 0
    }
  });
  if (!course) {
    throw new NotFoundResponse('Course not found');
  }
  const countReviews = await Review.countDocuments({ course: id });
  return { ...course, countReviews };
};

//Get course by id for user purchase
export const getCourseUserPurchaseService = async (id: string) => {
  const course = await getCourseDetail(id);
  if (!course) {
    throw new NotFoundResponse('Course not found');
  }
  return course;
};

//Get List Course
export const getListCourseService = async (page: number, limit: number, category?: string, search?: string) => {
  const courses = await getCourseList({ page, limit, category, search });

  const condition: any = { isActive: true };
  if (category) {
    condition['category'] = category;
  }
  if (search) {
    condition['name'] = { $regex: search, $options: 'i' };
  }

  const total = await Course.countDocuments(condition);
  return { courses, total, page, limit };
};

//Get List Course Purchased
export const getListCoursePurchasedService = async ({
  page,
  limit,
  user
}: {
  page: number;
  limit: number;
  user: IUser;
}) => {
  const courses = await Promise.all(
    user.courses.map(async (item) => {
      return await getCourseDetail(item.courseId.toString());
    })
  );
  const courseConfig = courses
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice((page - 1) * limit, page * limit);
  const total = courses.length;
  return { courses: courseConfig, total, page, limit };
};

//For Admin
export const getAllCourseService = async ({ page, limit }: { page: number; limit: number }) => {
  const courses = await findAllCoursePaginate({ page, limit, inc: false });
  const total = await Course.countDocuments();
  return { courses, total, page, limit };
};

//For Admin
export const changeStatusCourseService = async (id: string) => {
  const course = await Course.findById(id);
  if (!course) {
    throw new NotFoundResponse('Course not found');
  }
  await Course.findByIdAndUpdate(id, { isActive: !course.isActive });
};

//For Admin
export const uploadVideoCourseService = async (file: Express.Multer.File) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'lms/videos',
        public_id: uuidv4()
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as UploadApiResponse);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export const deleteVideoCourseService = async (publicId: string[]) => {
  await Promise.all(publicId.map(async (id) => await cloudinary.uploader.destroy(id, { resource_type: 'video' })));
};

export const changeOrderLectureService = async (
  body: TLectureChangeOrder & { courseId: string; sectionId: string }
) => {
  //Kiểm tra lecture original có tồn tại không
  const lectureOriginal = await LectureData.findById(body.lectureOriginal.id);
  if (!lectureOriginal) {
    throw new NotFoundResponse('Lecture Original not found');
  }

  //Kiểm tra lecture target có tồn tại không
  const lectureTarget = await LectureData.findById(body.lectureTarget.id);
  if (!lectureTarget) {
    throw new NotFoundResponse('Lecture Target not found');
  }

  //Kiểm tra section có tồn tại không
  const foundSection = await Section.findById(body.sectionId);
  if (!foundSection) {
    throw new NotFoundResponse('Section not found');
  }

  //Kiểm tra lecture có thuộc section
  const lecturesInSection = foundSection.lectures.map((item) => item.toString());
  if (!lecturesInSection.includes(body.lectureOriginal.id) || !lecturesInSection.includes(body.lectureTarget.id)) {
    throw new BadRequestResponse('Lecture not in section');
  }

  //Gắn order của lecture original bằng order của lecture target
  lectureOriginal.videoOrder = body.lectureTarget.order;

  //Nếu order của lecture original nhỏ hơn order của lecture target thì giảm order của các lecture có order lớn hơn order của lecture original và nhỏ hơn order của lecture target -> tức là trường hợp di chuyển từ trên xuống dưới
  if (body.lectureOriginal.order < body.lectureTarget.order) {
    await LectureData.updateMany(
      {
        _id: { $in: foundSection.lectures },
        videoOrder: { $gt: body.lectureOriginal.order, $lte: body.lectureTarget.order }
      },
      { $inc: { videoOrder: -1 } }
    );
  } else {
    //Nếu order của lecture original lớn hơn order của lecture target thì tăng order của các lecture có order lớn hơn order của lecture target và nhỏ hơn order của lecture original -> tức là trường hợp di chuyển từ dưới lên trên
    await LectureData.updateMany(
      {
        _id: { $in: foundSection.lectures },
        videoOrder: { $gte: body.lectureTarget.order, $lt: body.lectureOriginal.order }
      },
      { $inc: { videoOrder: +1 } }
    );
  }
  await lectureOriginal.save();
};

export const addSectionCourseService = async (courseId: string, body: TAddSection) => {
  const foundCourse = await Course.findById(courseId);
  if (!foundCourse) {
    throw new NotFoundResponse('Course not found');
  }

  const lectures = await LectureData.insertMany(body.lectures);
  const lectureIds = lectures.map((lecture) => lecture._id);
  const newSection = await Section.create({
    title: body.title,
    order: body.order,
    lectures: lectureIds
  });

  foundCourse.sections.push(newSection._id as ObjectId);
  await foundCourse.save();
};
