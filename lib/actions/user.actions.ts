"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "@/lib/mongoose";
import { FilterQuery, SortOrder } from "mongoose";
import User from "@/lib/models/user.model";
import Thread from "@/lib/models/thread.model";
import Community from "@/lib/models/community.model";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {

  try {
    connectToDB();
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if(path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string): Promise<any> {
  try {
    connectToDB();
    return await User
      .findOne({ id: userId })
      .populate({
        path: "communities",
        model: "Community",
      });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

/**
 * Fetches a user's threads from a database.
 * 
 * @param userId - The ID of the user whose threads need to be fetched.
 * @returns The user object with the `threads` field populated with additional information from related models.
 * @throws If there is an error while fetching the user's threads.
 * 
 * @example
 * const userId = "12345";
 * const userThreads = await fetchUserThreads(userId);
 * console.log(userThreads);
 * 
 * The code above fetches the threads of the user with the ID "12345" and logs the populated user object, including the threads and their related information.
 */
export async function fetchUserThreads(userId: string) {
  try {
    connectToDB();
    const threads = await User.findOne({
      id: userId
    }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id",
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id",
          },
        },
      ],
    });

    return threads;

  } catch (error: any) {
    throw new Error(`Failed to fetch user's threads: ${error.message}`);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortOrder = "desc"
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortOrder?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortOrder };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext }

  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    const userThreads = await Thread.find({
      author: userId
    });

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds = userThreads.reduce((accumilator, userThread) => {
      return accumilator.concat(userThread.children);
    }, []);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;

  } catch (error: any) {
    throw new Error(`Failed to fetch the user's activity: ${error.message}`);
  }
}