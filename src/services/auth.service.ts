import bcrypt from 'bcryptjs';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import lodash from 'lodash';
import { LoginBody, RegisterBody, VerificationBody } from '~/@types/auth';
import env from '~/config/env';
import { BadRequestResponse, NotFoundResponse, UnauthorizedResponse } from '~/core/error.response';
import { redis } from '~/db/db.init';
import { sendMailWithHtml } from '~/mailtrap/sendMail';
import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from '~/mailtrap/templates';
import { findTokenByUserId } from '~/models/repository/token.repo';
import { findUserByEmail } from '~/models/repository/user.repo';
import Token from '~/models/tokens.model';
import User from '~/models/user.model';
import { generateKeys, generateToken, sendCookieToken } from '~/utils';
import { updateUserInfoRedis } from '~/utils/redis';

export const registerService = async (body: RegisterBody) => {
  //Create code and token
  const code = Math.floor(100000 + Math.random() * 900000);
  console.log('Code: ', code);
  //Send email verification email
  await sendMailWithHtml({
    recipients: [{ email: body.email }],
    subject: 'Email Verification',
    html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', code.toString()),
    category: 'email-verification'
  });
  //Check if the user already exists
  const user = await findUserByEmail(body.email);
  if (user) {
    throw new BadRequestResponse('User already exists');
  }
  //Save user to database
  const newUser = await User.create({
    name: body.name,
    email: body.email,
    password: body.password
  });

  const token = generateToken({
    payload: { userId: newUser._id, role: newUser.role, code },
    secretKey: env.JWT.VERIFY || '',
    expire: '5m'
  }); //5 minutes

  return {
    token,
    user: {
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar
    }
  };
};

export const resendVerifyEmailService = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new NotFoundResponse('User not found');
  }
  if (user.isVerified) {
    throw new BadRequestResponse('Email already verified');
  }
  //Create code and token
  const code = Math.floor(100000 + Math.random() * 900000);
  console.log('Code: ', code);

  const token = generateToken({
    payload: { userId: user._id, role: user.role, code },
    secretKey: env.JWT.VERIFY || '',
    expire: '5m'
  }); //5 minutes

  //Send email verification email
  await sendMailWithHtml({
    recipients: [{ email: user.email }],
    subject: 'Email Verification',
    html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', code.toString()),
    category: 'email-verification'
  });
  return {
    token,
    user: {
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }
  };
};

export const verifyEmailService = async (body: VerificationBody) => {
  const token = body.token;
  const decode = (await jwt.verify(token, env.JWT.VERIFY || '')) as { code: number; userId: string; role: string };
  if (decode?.code != body.code) {
    throw new BadRequestResponse('Invalid verification code');
  }

  const user = await User.findById(decode.userId);
  if (!user) {
    throw new NotFoundResponse('User not found');
  }
  if (user.isVerified) {
    throw new BadRequestResponse('Email already verified');
  }
  await User.findByIdAndUpdate({ _id: decode.userId }, { isVerified: true });
};

export const loginService = async (body: LoginBody, res: Response) => {
  const { email, password } = body;
  const user = await findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedResponse('Invalid email or password');
  }
  if (user.disabled) {
    throw new UnauthorizedResponse('User is disabled');
  }
  const isPasswordCompard = await user.comparePassword(password);
  if (!isPasswordCompard) {
    throw new UnauthorizedResponse('Invalid email or password');
  }
  if (!user.isVerified) {
    throw new UnauthorizedResponse('Email not verified');
  }
  //Generate public key (access token) and private key (refresh token)
  const { publicKey, privateKey } = generateKeys();

  const accessToken = generateToken({ payload: { userId: user._id, role: user.role }, secretKey: publicKey });
  const refreshToken = generateToken({ payload: { userId: user._id, role: user.role }, secretKey: privateKey });

  //Save refresh token to database
  await Token.findOneAndUpdate(
    { userId: user._id },
    { refreshToken: refreshToken, publicKey, privateKey },
    {
      upsert: true
    }
  );

  sendCookieToken(res, accessToken, refreshToken);
  //set info user into redis
  await updateUserInfoRedis(publicKey, user);

  return {
    user: lodash.omit(user.toJSON(), ['password', '__v', 'createdAt', 'updatedAt']),
    accessToken: accessToken
  };
};

export const logoutService = async (userId: string, res: Response) => {
  //Update refresh token in database
  // await Token.findOneAndUpdate(
  //   { userId },
  //   { refreshToken: '', publicKey: '', privateKey: '', $push: { refreshTokenUsed: refreshToken } }
  // );

  //Clear cookies
  res.cookie('refreshToken', '', {
    maxAge: 1
  });
  res.cookie('accessToken', '', {
    maxAge: 1
  });

  //Clear redis
  await redis.del(userId);
};

export const forgotPasswordService = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new NotFoundResponse('User not found');
  }
  if (user.disabled) {
    throw new UnauthorizedResponse('User is disabled');
  }
  const token = generateToken({
    payload: { userId: user._id },
    secretKey: env.JWT.FORGOT_PASSWORD || '',
    expire: '15m'
  }); //15 minutes
  const url = `${env.CLIENT_URL}/reset-password?token=${token}`;
  console.log('token', token);

  await sendMailWithHtml({
    recipients: [{ email }],
    subject: 'Reset password',
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', url),
    category: 'forgot-password'
  });
};

export const resetPasswordService = async ({ token, newPassword }: { token: string; newPassword: string }) => {
  const decode = (await jwt.verify(token, env.JWT.FORGOT_PASSWORD || '')) as { userId: string };
  const user = await User.findById(decode.userId);
  if (!user) {
    throw new NotFoundResponse('User not found');
  }
  if (user.disabled) {
    throw new UnauthorizedResponse('User is disabled');
  }
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate({ _id: decode.userId }, { password: newPasswordHash });
};

export const refreshTokenService = async (refreshToken: string, res: Response, clientId: string) => {
  //Find private key in database
  const token = await findTokenByUserId(clientId);
  if (!token) {
    throw new UnauthorizedResponse('Unauthorized');
  }
  const { privateKey, publicKey } = token;

  //Check if refresh token is valid
  await jwt.verify(refreshToken, privateKey);
  //Check if refresh token is used and in database
  if (token.refreshTokenUsed.includes(refreshToken) || token.refreshToken !== refreshToken) {
    redis.del(clientId);
    throw new UnauthorizedResponse('Please login again');
  }
  //Generate new access token and refresh token
  const user = await User.findById(clientId);
  if (!user) {
    throw new NotFoundResponse('User not found');
  }
  if (user.disabled) {
    throw new UnauthorizedResponse('User is disabled');
  }

  const accessTokenNew = generateToken({ payload: { userId: token.userId, role: user.role }, secretKey: publicKey });
  const refreshTokenNew = generateToken({ payload: { userId: token.userId, role: user.role }, secretKey: privateKey });

  //Save new refresh token to database
  //Update refresh token used in database
  await Token.findOneAndUpdate(
    { userId: token.userId },
    { refreshToken: refreshTokenNew, $push: { refreshTokenUsed: refreshToken } }
  );

  //Save new access token and refresh token to cookies
  sendCookieToken(res, accessTokenNew, refreshTokenNew);
  return {
    accessToken: accessTokenNew
  };
};

export const socialLoginService = async (user: RegisterBody & { avatar: string }, res: Response) => {
  let foundUser = await findUserByEmail(user.email);
  if (!foundUser) {
    foundUser = await User.create({
      name: user.name,
      email: user.email,
      avatar: {
        url: user.avatar,
        public_id: ''
      },
      isVerified: true,
      role: 'user',
      password: ''
    });
  }
  const { publicKey, privateKey } = generateKeys();

  const accessToken = generateToken({ payload: { userId: foundUser._id, role: foundUser.role }, secretKey: publicKey });
  const refreshToken = generateToken({
    payload: { userId: foundUser._id, role: foundUser.role },
    secretKey: privateKey
  });

  //Save refresh token to database
  await Token.findOneAndUpdate(
    { userId: foundUser._id },
    { refreshToken: refreshToken, publicKey, privateKey },
    {
      upsert: true
    }
  );

  sendCookieToken(res, accessToken, refreshToken);
  //set info user into redis
  await updateUserInfoRedis(publicKey, foundUser);
  return {
    user: lodash.omit(foundUser.toJSON(), ['password', '__v', 'createdAt', 'updatedAt']),
    accessToken: accessToken
  };
};
