import lodash from 'lodash';
import { NotFoundResponse } from '~/core/error.response';
import LectureData from '~/models/lectures.model';
import NotificationModel from '~/models/notification.model';
import QA, { IQA } from '~/models/qa.model';
import { findQAById, findQAChildren, findQAMaxRight } from '~/models/repository/qa.repo';
import { findUserById } from '~/models/repository/user.repo';

export const createQAService = async (qa: IQA) => {
  const lecture = await LectureData.findOne({ _id: qa.courseDataId });
  if (!lecture) {
    throw new NotFoundResponse('Lecture not found');
  }
  let rightNewQA = 0;
  let levelNewQA = 0;
  if (!qa.qaParent) {
    const qaParentMax = await findQAMaxRight(qa.courseDataId.toString());
    rightNewQA = (qaParentMax?.qaRight || 0) + 1;
  } else {
    const qaParent = await QA.findOne({ _id: qa.qaParent });
    if (!qaParent) {
      throw new NotFoundResponse('QA parent not found');
    }
    rightNewQA = qaParent.qaRight;
    levelNewQA = qaParent.qaLevel + 1;

    //Update right of all nodes
    await QA.updateMany(
      {
        courseDataId: qa.courseDataId,
        qaRight: { $gte: rightNewQA }
      },
      { $inc: { qaRight: 2 } }
    );
    //Update left of all nodes
    await QA.updateMany(
      {
        courseDataId: qa.courseDataId,
        qaLeft: { $gt: rightNewQA }
      },
      { $inc: { qaLeft: 2 } }
    );
  }
  let leftNewQA = rightNewQA;
  rightNewQA += 1;
  const newQA = await QA.create({
    courseDataId: qa.courseDataId,
    qaParent: qa.qaParent,
    qaText: qa.qaText,
    qaRight: rightNewQA,
    qaLeft: leftNewQA,
    qaLevel: levelNewQA,
    qaUser: qa.qaUser
  });

  //Send Notificate to Admin
  const user = await findUserById(qa.qaUser.toString());
  if (user && user.role !== 'admin') {
    await NotificationModel.create({
      userId: user._id,
      title: 'New QA',
      message: `You have created a new QA in lesson ${lecture.title}`
    });
  }
  const result = {
    ...newQA.toJSON(),
    qaUser: {
      _id: user?._id,
      avatar: user?.avatar,
      name: user?.name,
      role: user?.role
    }
  };

  return result;
};

export const getQAListLevelZeroService = async ({
  courseDataId,
  page,
  limit
}: {
  courseDataId: string;
  page: number;
  limit: number;
}) => {
  const qaList = await QA.find({
    courseDataId,
    qaLevel: 0
  })
    .sort({ createdAt: -1 })
    .populate('qaUser')
    .skip((page - 1) * limit)
    .limit(limit);
  const qaListCount = await QA.countDocuments({ courseDataId, qaLevel: 0 });
  const qaListConfig = await Promise.all(
    qaList.map(async (qa) => {
      const userConfig = lodash.pick(qa.qaUser, ['_id', 'name', 'avatar', 'role']);
      const qaConfig = lodash.pick(qa, ['_id', 'qaText', 'qaLevel', 'createdAt']);
      //Đếm sl câu trả lời
      const qaChildCount = await QA.countDocuments({
        courseDataId,
        qaParent: qa._id
      });
      return {
        ...qaConfig,
        qaUser: userConfig,
        qaChildCount
      };
    })
  );
  return {
    qa_list: qaListConfig,
    qa_count: qaListCount,
    page,
    limit
  };
};

export const getQAListByParentService = async ({ qaParentId }: { qaParentId: string }) => {
  const qaParent = await findQAById(qaParentId);
  if (!qaParent) {
    throw new NotFoundResponse('QA parent not found');
  }
  const qaChild = await findQAChildren({ left: qaParent.qaLeft, right: qaParent.qaRight, level: qaParent.qaLevel });
  const qaChildConfig = await Promise.all(
    qaChild.map(async (qa) => {
      const userConfig = lodash.pick(qa.qaUser, ['_id', 'name', 'avatar', 'role']);
      const qaConfig = lodash.pick(qa, ['_id', 'qaText', 'qaLevel', 'createdAt']);
      //Đếm sl câu trả lời
      const qaChildCount = await QA.countDocuments({
        courseDataId: qa.courseDataId,
        qaParent: qa._id
      });
      return {
        ...qaConfig,
        qaUser: userConfig,
        qaChildCount
      };
    })
  );
  return qaChildConfig;
};

//Delete QA
export const deleteQAService = async ({ qaId, user }: { qaId: string; user: string }) => {
  const qa = await findQAById(qaId);
  if (!qa) {
    throw new NotFoundResponse('QA not found');
  }
  if (qa.qaUser.toString() !== user.toString()) {
    throw new NotFoundResponse('You are not allowed to delete this QA');
  }
  const qaLeft = qa.qaLeft;
  const qaRight = qa.qaRight;
  await QA.deleteMany({
    qaLeft: { $gte: qaLeft },
    qaRight: { $lte: qaRight }
  });

  const qaWidth = qaRight - qaLeft + 1;

  await QA.updateMany(
    {
      qaRight: { $gt: qaRight }
    },
    { $inc: { qaRight: -qaWidth } }
  );

  await QA.updateMany(
    {
      qaLeft: { $gt: qaRight }
    },
    { $inc: { qaLeft: -qaWidth } }
  );
};
