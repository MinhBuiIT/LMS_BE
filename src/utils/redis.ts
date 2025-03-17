import { redis } from '~/db/db.init';
import { IUser } from '~/models/user.model';

export const updateUserInfoRedis = async (publicKey: string, user: IUser) => {
  //set info user into redis
  const userInfo = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    courses: user.courses
  };
  await redis.set(user._id as string, JSON.stringify({ publicKey, ...userInfo }), 'EX', 7 * 24 * 60 * 60); //7 days
};
