import Redis from 'ioredis';
import mongoose from 'mongoose';
import env from '~/config/env';

export const redis = new Redis(env.DB.REDIS as string);

class Database {
  public static instanceDatabase: Database | null = null;

  public async connectMongoDB() {
    try {
      await mongoose.connect(env.DB.MONGO as string);
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.log('Error connecting to MongoDB: ', error);
    }
  }

  public async connectRedis() {
    try {
      redis.on('connect', () => {
        console.log('Connected to Redis successfully');
      });
      redis.on('error', (error: any) => {
        console.log('Error connecting to Redis: ', error);
      });
    } catch (error) {
      console.log('Error connecting to Redis: ', error);
    }
  }

  public static getInstance(): Database {
    if (this.instanceDatabase === null) {
      this.instanceDatabase = new Database();
    }
    return this.instanceDatabase;
  }
}
const instanceDb = Database.getInstance();
export default instanceDb;
