import { IUser } from '~/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user: Pick<IUser, 'name' | 'email' | 'role' | 'courses' | 'avatar' | '_id'> & { publicKey: string };
    }
  }
}
