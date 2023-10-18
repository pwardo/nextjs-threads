import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const connect = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    dbName: "NextJS-Threads"
  });
  process.env.MONGODB_URL = await mongoServer.getUri();
};

export const dropData = async (): Promise<void> => {
  await mongoose.connection.db.dropDatabase();
};

export const disconnect = async (): Promise<void> => {
  mongoose.disconnect();
  mongoServer.stop();
};