import { Router } from 'express';
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  socialLoginController,
  verifyEmailController
} from '~/controllers/auth.controller';
import { authenticationMiddleware } from '~/middlewares/auth.middleware';
import catchError from '~/utils/catchError';

const routeAuth = Router();

routeAuth.post('/register', catchError(registerController));
routeAuth.post('/verify-email', catchError(verifyEmailController));
routeAuth.post('/resend-verify-email', catchError(resendVerifyEmailController));
routeAuth.post('/login', catchError(loginController));
routeAuth.post('/logout', authenticationMiddleware, catchError(logoutController));
routeAuth.post('/forgot-password', catchError(forgotPasswordController));
routeAuth.post('/reset-password', catchError(resetPasswordController));
routeAuth.post('/refresh-token', catchError(refreshTokenController));
routeAuth.post('/social-login', catchError(socialLoginController));

export default routeAuth;
