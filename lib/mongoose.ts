import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if(!process.env.MONGODB_URL) {
    throw new Error('MONGODB_URL not set');
  }

  if(isConnected) return console.log('already connected');

  try {
    await mongoose.connect(
      process.env.MONGODB_URL, {
        dbName: 'NextJS-Threads',
    });
    isConnected = true;
    console.log('connected to db');
  } catch (error) {
    console.log('error connecting to db', error);
  }
}