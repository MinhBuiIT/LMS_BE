import { NextFunction, Request, Response } from 'express';
import { LoginBody, RegisterBody, VerificationBody } from '~/@types/auth';
import { EMAIL_REGEX, PASSWORD_REGEX } from '~/constants';
import { BadRequestResponse } from '~/core/error.response';
import { CreatedResponse, OKResponse } from '~/core/success.response';
import {
  forgotPasswordService,
  loginService,
  logoutService,
  refreshTokenService,
  registerService,
  resendVerifyEmailService,
  resetPasswordService,
  socialLoginService,
  verifyEmailService
} from '~/services/auth.service';
import { getKeyObjectEmpty } from '~/utils';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as RegisterBody;
  const bodyConfig = {
    email: body?.email || null,
    password: body?.password || null,
    name: body?.name || null
  };

  const keysEmpty = getKeyObjectEmpty(bodyConfig);

  if (Object.keys(keysEmpty).length > 0) {
    return next(new BadRequestResponse('Missing required fields', keysEmpty));
  }

  if (!PASSWORD_REGEX.test(body.password)) {
    return next(
      new BadRequestResponse('Password must contain at least 6 characters, including one letter and one number')
    );
  }
  if (!EMAIL_REGEX.test(body.email)) {
    return next(new BadRequestResponse('Invalid email'));
  }

  const data = await registerService(body);

  return new CreatedResponse({ message: 'User registered', data }).send(res);
};

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email;
  if (!email) {
    return next(new BadRequestResponse('Email is required'));
  }
  const data = await resendVerifyEmailService(email);
  return new OKResponse({ message: 'Email verification sent', data }).send(res);
};

export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as VerificationBody;
  const bodyConfig = {
    token: body?.token || null,
    code: body?.code || null
  };
  const keysEmpty = getKeyObjectEmpty(bodyConfig);
  if (Object.keys(keysEmpty).length > 0) {
    return next(new BadRequestResponse('Missing required fields', keysEmpty));
  }
  const data = await verifyEmailService(body);
  return new OKResponse({ message: 'Email verified', data: null }).send(res);
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as LoginBody;
  const bodyConfig = {
    email: body?.email || null,
    password: body?.password || null
  };
  const keysEmpty = getKeyObjectEmpty(bodyConfig);
  if (Object.keys(keysEmpty).length > 0) {
    return next(new BadRequestResponse('Missing required fields', keysEmpty));
  }

  const data = await loginService(body, res);
  return new OKResponse({ message: 'Login success', data }).send(res);
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user._id;
  await logoutService(userId, res);

  return new OKResponse({ message: 'Logout success', data: null }).send(res);
};

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as { email: string };
  if (!body.email) {
    return next(new BadRequestResponse('Email is required'));
  }
  await forgotPasswordService(body.email);
  return new OKResponse({ message: 'Please check email to reset password', data: null }).send(res);
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as { newPassword: string; token: string };
  const bodyConfig: { newPassword?: string; token?: string } = {
    token: body?.token || undefined,
    newPassword: body?.newPassword || undefined
  };
  const keysEmpty = getKeyObjectEmpty(bodyConfig);
  if (Object.keys(keysEmpty).length > 0) {
    return next(new BadRequestResponse('Missing required fields', keysEmpty));
  }
  if (!PASSWORD_REGEX.test(body.newPassword)) {
    return next(
      new BadRequestResponse('Password must contain at least 6 characters, including one letter and one number')
    );
  }
  await resetPasswordService(body);
  return new OKResponse({ message: 'Password reset success', data: null }).send(res);
};

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  const clientId = req.headers['client-id'] as string;
  if (!refreshToken) {
    throw new BadRequestResponse('Refresh token is required');
  }
  if (!clientId) {
    throw new BadRequestResponse('Client Id is required');
  }

  const data = await refreshTokenService(refreshToken, res, clientId);
  return new OKResponse({ message: 'Refresh token success', data }).send(res);
};

export const socialLoginController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  const data = await socialLoginService(body, res);
  return new OKResponse({ message: 'Social login success', data }).send(res);
};
