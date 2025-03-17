import { Document, Model } from 'mongoose';

type ModelAnalyticType = {
  month: string;
  count: number;
};

async function generateAnalytic<T extends Document>(model: Model<T>): Promise<ModelAnalyticType[]> {
  const result: ModelAnalyticType[] = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  for (let i = 11; i >= 0; i--) {
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i * 28);
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 28);

    const month = endDate.toLocaleString('default', { month: 'short', year: 'numeric', day: 'numeric' });
    const count = await model.countDocuments({
      createdAt: { $gte: startDate, $lt: endDate }
    });
    result.push({ month, count });
  }
  return result;
}

export default generateAnalytic;
