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
  connectToDB();
  try {
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
  connectToDB();
  try {
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

  } catch (error: any) {
    throw new Error(`Failed to fetch threads: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  try {
    connectToDB();

    const thread = await Thread.findById(threadId)
    .populate({
      path: "author",
      model: User,
      select: "_id id name image",
    })
    .populate({
      path: "children",
      populate: [        
        {
          path: "author",
          model: User,
          select: "_id id name parentId image",
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          }
        }
      ]
    }).exec();

    return thread;

  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function addCommentToThread(threadId: string, commentText: string, userId: string, path: string) {
  connectToDB();
  try {

    const originalThread = await Thread.findById(threadId);
    if(!originalThread) {
      throw new Error(`Thread not found`);
    }

    const comment = commentText.trim();
    const author = userId;

    const createdComment = new Thread({
      content: comment,
      author: userId,
      parentId: threadId,
    });

    const savedCommentThread = await createdComment.save();

    originalThread.children.push(savedCommentThread._id);

    await originalThread.save();

    revalidatePath(path);

  } catch (error: any) {
    throw new Error(`Failed to add comment to thread: ${error.message}`);
  }
}
