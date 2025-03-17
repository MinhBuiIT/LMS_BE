import bcrypt from 'bcryptjs';
import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: {
    url: string;
    public_id: string;
  };
  role: string;
  courses: Array<{ courseId: string }>;
  isVerified: boolean;
  disabled: boolean;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String
    },
    avatar: {
      url: {
        type: String,
        default: ''
      },
      public_id: {
        type: String,
        default: ''
      }
    },
    courses: [
      {
        courseId: String
      }
    ],
    role: {
      type: String,
      default: 'user'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }
  const hashPassword = await bcrypt.hash(user.password, 10);
  user.password = hashPassword;
  next();
});

const User = model<IUser>('User', userSchema);

export default User;
