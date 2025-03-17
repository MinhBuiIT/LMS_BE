import User from '../user.model';

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const findUserById = async (id: string) => {
  return await User.findById(id);
};

export const findAllUser = async ({ inc = false, selectField }: { inc: boolean; selectField: string }) => {
  return await User.find()
    .sort({ createdAt: inc ? 1 : -1 })
    .select(selectField);
};
