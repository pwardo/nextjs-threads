import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if(!process.env.MONGODB_URL) {
    throw new Error('MONGODB_URL not set');
  }

  if(isConnected) return;

  try {
    await mongoose.connect(
      process.env.MONGODB_URL, {
        dbName: 'NextJS-Threads',
    });
    isConnected = true;
  } catch (error) {
    console.log('error connecting to db', error);
  }
}