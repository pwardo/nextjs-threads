"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  content: string,
  author: string,
  community: string | null,
  path: string,
}

export async function createThread({
  content,
  author,
  community,
  path
}: 
  Params
) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      content,
      author,
      community: null,
    });
  
    await User.findByIdAndUpdate(author, {
      $push: {
        threads: createdThread._id
      }
    });
  
    revalidatePath(path);
  
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    const threadsQuery = Thread.find({
      parentId: { $in: [null, undefined] }
    })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
      select: "_id id name image",
    })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

    const totalThreadsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] }
    });

    const threads = await threadsQuery.exec();

    const isNextPageAvailable = totalThreadsCount > skipAmount + threads.length;

    return { threads, isNextPageAvailable }

  } catch (error) {
    
  }
}