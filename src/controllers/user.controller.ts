import { NextFunction, Request, Response } from 'express';
import lodash from 'lodash';
import { BadRequestResponse } from '~/core/error.response';
import { OKResponse } from '~/core/success.response';
import {
  addUserIntoCourseService,
  changePasswordService,
  changeRoleUserService,
  disableUserService,
  getAllUserService,
  getUserInfoByEmailService,
  updateUserInfoService,
  uploadAvatarService
} from '~/services/user.service';

export const updateUserInfoController = async (req: Request, res: Response, next: NextFunction) => {
  const { email, name } = req.body;
  const { _id, publicKey } = (req as any)?.user;
  if (!email || !name) {
    throw new BadRequestResponse('Email and name are required');
  }
  const data = await updateUserInfoService({ email, name, id: _id as string, publicKey });
  return new OKResponse({ message: 'Update user info successfully', data: data.newUserInfo }).send(res);
};

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { oldPassword, newPassword } = req.body;
  const { _id } = (req as any)?.user;
  if (!newPassword || oldPassword === null || oldPassword === undefined) {
    throw new BadRequestResponse('Old password and new password are required');
  }
  await changePasswordService({ oldPassword, newPassword, id: _id as string });
  return new OKResponse({ message: 'Change password successfully', data: null }).send(res);
};

export const uploadAvatarController = async (req: Request, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  const { _id, publicKey } = (req as any)?.user;
  if (!avatar) {
    throw new BadRequestResponse('Avatar is required');
  }
  const data = await uploadAvatarService({ id: _id as string, avatar, publicKey });
  return new OKResponse({ message: 'Upload avatar successfully', data: data.user }).send(res);
};

export const getUserInfoController = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any)?.user;
  return new OKResponse({ message: 'Get user info successfully', data: lodash.omit(user, ['publicKey']) }).send(res);
};

//For admin
export const getAllUserController = async (req: Request, res: Response, next: NextFunction) => {
  const users = await getAllUserService();
  new OKResponse({ message: 'Get all user successfully', data: users }).send(res);
};

//For admin
export const changeRoleUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { role, userId } = req.body;
  if (!role || !userId) {
    throw new BadRequestResponse('Role and userId are required');
  }
  await changeRoleUserService(userId, role);
  return new OKResponse({ message: 'Change role user successfully', data: null }).send(res);
};

//For admin
export const addUserIntoCourseController = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, courseId } = req.body;
  if (!userId || !courseId) {
    throw new BadRequestResponse('UserId and courseId are required');
  }
  await addUserIntoCourseService(userId, courseId);
  return new OKResponse({ message: 'Add user into course successfully', data: null }).send(res);
};

//For Admin
export const disableUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  if (!userId) {
    throw new BadRequestResponse('UserId is required');
  }
  await disableUserService(userId);
  return new OKResponse({ message: 'Change status user successfully', data: null }).send(res);
};

//For Admin
export const getUserInfoByEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await getUserInfoByEmailService(req.body.email);
  return new OKResponse({ message: 'Get user info by email successfully', data }).send(res);
};
