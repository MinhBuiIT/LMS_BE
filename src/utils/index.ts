import crypto from 'crypto';
import { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';
import env from '~/config/env';

export const generateToken = ({ payload, expire, secretKey }: { payload: any; expire?: string; secretKey: string }) => {
  if (!expire) {
    return jwt.sign(payload, secretKey);
  }
  return jwt.sign(payload, secretKey, { expiresIn: expire });
};

export const getKeyObjectEmpty = (obj: any) => {
  let result: any = {};
  for (let key in obj) {
    if (obj[key] === null || obj[key] === undefined) {
      result[key] = `The ${key} field is required`;
    }
  }
  return result;
};

export const generateKeys = () => {
  const publicKey = crypto.randomBytes(16).toString('hex');
  const privateKey = crypto.randomBytes(16).toString('hex');
  return { publicKey, privateKey };
};

export const sendCookieToken = (res: Response, accessToken: string, refreshToken: string) => {
  const cookieOptions: CookieOptions = {
    sameSite: 'lax',
    httpOnly: true
  };
  if (env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: +(env.JWT.REFRESH_TOKEN_EXPIRES || 0) * 24 * 60 * 60 * 1000
  });
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: +(env.JWT.ACCESS_TOKEN_EXPIRES || 0) * 24 * 60 * 60 * 1000
  });
};
