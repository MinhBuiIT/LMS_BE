import bcrypt from 'bcryptjs';
import lodash from 'lodash';
import { ChangePasswordBody, UpdateInfoUserBody, UploadAvatarBody } from '~/@types/user';
import cloudinary from '~/config/cloudinary';
import { BadRequestResponse } from '~/core/error.response';
import { redis } from '~/db/db.init';
import Course from '~/models/course.model';
import { findAllUser, findUserByEmail, findUserById } from '~/models/repository/user.repo';
import Token from '~/models/tokens.model';
import User, { IUser } from '~/models/user.model';
import { updateUserInfoRedis } from '~/utils/redis';

export const updateUserInfoService = async ({ email, name, id, publicKey }: UpdateInfoUserBody) => {
  const user = await findUserByEmail(email);
  if (user && user.id !== id) {
    throw new BadRequestResponse('Email already exists');
  }
  const newUserInfo = await User.findOneAndUpdate(
    { _id: id },
    { email, name },
    {
      new: true
    }
  );
  //set info user into redis
  await updateUserInfoRedis(publicKey, newUserInfo as IUser);
  return {
    newUserInfo: lodash.omit(newUserInfo?.toJSON(), ['password', '__v', 'isVerified'])
  };
};

export const changePasswordService = async ({ id, oldPassword, newPassword }: ChangePasswordBody) => {
  const user = await User.findById(id);
  if (!user) {
    throw new BadRequestResponse('User not found');
  }
  const isPasswordCompard = await user.comparePassword(oldPassword);
  if (!isPasswordCompard) {
    throw new BadRequestResponse('Invalid old password');
  }
  const hashPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate({ _id: id }, { password: hashPassword });
};

export const uploadAvatarService = async ({ id, avatar, publicKey }: UploadAvatarBody) => {
  const user = await User.findById(id);
  if (!user) {
    throw new BadRequestResponse('User not found');
  }
  if (user.avatar?.public_id) {
    //delete old avatar
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }
  const result = await cloudinary.uploader.upload(avatar, {
    folder: 'lms/avatar',
    width: 200,
    height: 200
  });
  const newUserData = await User.findOneAndUpdate(
    { _id: id },
    { avatar: { url: result.secure_url, public_id: result.public_id } },
    { new: true }
  );
  //set info user into redis
  await updateUserInfoRedis(publicKey, newUserData as IUser);
  return {
    user: lodash.omit(newUserData?.toJSON(), ['password', '__v', 'isVerified'])
  };
};

// For Admin
export const getAllUserService = async () => {
  return await findAllUser({ inc: false, selectField: '-password -__v -isVerified' });
};

//Change Role User --- Admin

export const changeRoleUserService = async (id: string, role: string) => {
  const user = await findUserById(id);
  if (!user) {
    throw new BadRequestResponse('User not found');
  }
  await User.findByIdAndUpdate({ _id: id }, { role });
};

//Add User Into Course --- Admin

export const addUserIntoCourseService = async (id: string, courseId: string) => {
  const user = await findUserById(id);
  if (!user) {
    throw new BadRequestResponse('User not found');
  }
  const course = await Course.findById(courseId);
  if (!course) {
    throw new BadRequestResponse('Course not found');
  }
  const checkCoursePurchases = user.courses.some((course) => course.courseId.toString() === courseId);
  if (checkCoursePurchases) {
    throw new BadRequestResponse('User already purchased this course');
  }
  await User.findByIdAndUpdate({ _id: id }, { $push: { courses: { courseId } } });
  course.purchased = (course?.purchased || 0) + 1;
  await course.save();
};

//Disable User --- Admin
export const disableUserService = async (id: string) => {
  const user = await findUserById(id);
  if (!user) {
    throw new BadRequestResponse('User not found');
  }
  await redis.del(id);
  await Token.deleteMany({ userId: id });
  await User.findByIdAndUpdate({ _id: id }, { disabled: !user.disabled });
};

//Get User Info By Email -- Admin
export const getUserInfoByEmailService = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new BadRequestResponse('User not found');
  }
  return lodash.omit(user.toJSON(), ['password', '__v', 'isVerified']);
};
