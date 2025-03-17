import Token from '../tokens.model';

export const findTokenByUserId = async (userId: string) => {
  return await Token.findOne({ userId });
};
