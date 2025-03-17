import { PipelineStage, Types } from 'mongoose';
import Course from '../course.model';

export const getCourseDetail = async (courseId: string, project?: Object) => {
  let matchLookup = [
    {
      $match: {
        _id: new Types.ObjectId(courseId),
        isActive: true
      }
    },
    {
      $lookup: {
        from: 'sections',
        localField: 'sections',
        foreignField: '_id',
        as: 'sections'
      }
    },
    {
      $lookup: {
        from: 'lectures',
        localField: 'sections.lectures',
        foreignField: '_id',
        as: 'lectures'
      }
    }
  ];
  if (project) {
    matchLookup = [...matchLookup, project as any];
  }

  const course = (await Course.aggregate(matchLookup))[0];

  //Thay thế sections.lectures bằng lectures tương ứng -> cho field section bao gồm các lecture có đầy đủ thông tin
  course.sections = course.sections
    .map((section: any) => {
      const lecturesIdString = section.lectures.map((lecture: any) => lecture.toString());

      section.lectures = course.lectures.filter((lecture: any) => lecturesIdString.includes(lecture._id.toString()));
      return section;
    })
    .sort((a: any, b: any) => a.order - b.order); //Sắp xếp lại section theo order
  delete course.lectures;
  return course;
};

export const getCourseList = async ({
  page,
  limit,
  category,
  search
}: {
  page: number;
  limit: number;
  category?: string;
  search?: string;
}) => {
  const match: any = {
    isActive: true
  };
  if (category) {
    match['category'] = category;
  }
  if (search) {
    match['name'] = { $regex: search, $options: 'i' };
  }

  console.log('match', match);

  const paramsAggregate = [
    {
      $match: match
    },
    {
      $lookup: {
        from: 'course_data',
        localField: 'courseData',
        foreignField: '_id',
        as: 'courseData'
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $project: {
        courseData: 0,
        top_reviews: 0
      }
    }
  ];
  if (page && limit) {
    paramsAggregate.push({ $skip: (page - 1) * limit } as any);
    paramsAggregate.push({ $limit: limit } as any);
  }

  const courses = await Course.aggregate(paramsAggregate as PipelineStage[]);
  return courses;
};

export const findCourseById = async (courseId: string) => {
  const course = await Course.findById(courseId);
  return course;
};

export const findAllCourse = async ({ inc = false }: { inc?: boolean }) => {
  const courses = await Course.find().sort({ createdAt: inc ? 1 : -1 });
  return courses;
};

export const findAllCoursePaginate = async ({ page, limit, inc }: { page: number; limit: number; inc: boolean }) => {
  const courses = await Course.find()
    .sort({ createdAt: inc ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return courses;
};
