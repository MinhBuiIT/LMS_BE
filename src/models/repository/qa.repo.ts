import QA from '../qa.model';

export const findQAMaxRight = async (courseDataId: string) => {
  return await QA.findOne({ courseDataId }).sort({ qaRight: -1 });
};

export const findQAById = async (qaId: string) => {
  return await QA.findById(qaId);
};

export const findQAChildren = async ({ left, right, level }: { left: number; right: number; level: number }) => {
  return await QA.find({ qaLeft: { $gt: left }, qaRight: { $lt: right }, qaLevel: level + 1 })
    .sort({ createdAt: -1 })
    .populate('qaUser');
};
