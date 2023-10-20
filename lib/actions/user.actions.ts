"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "@/lib/mongoose";
import { FilterQuery, SortOrder } from "mongoose";
import User from "@/lib/models/user.model";
import Thread from "@/lib/models/thread.model";
import Community from "@/lib/models/community.model";

interface UpdateUserParams {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

/**
 * Updates a user's information in a MongoDB database.
 * If the user does not exist, a new document is created.
 * If the path parameter is "/profile/edit", the revalidatePath function is called.
 * @param userId - The ID of the user to be updated.
 * @param bio - The new bio of the user.
 * @param name - The new name of the user.
 * @param path - The path of the current page.
 * @param username - The new username of the user.
 * @param image - The new image URL of the user.
 * @throws Error if failed to create/update user.
 */
export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: UpdateUserParams): Promise<void> {
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
    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

/**
 * Fetches a user from a MongoDB database.
 * 
 * @param userId - The ID of the user to fetch.
 * @returns A Promise that resolves to the fetched user object from the database.
 * @throws If the user is not found with the specified ID.
 */
export async function fetchUser(userId: string): Promise<any> {
  try {
    connectToDB();
    const user = await User
      .findOne({ id: userId })
      .populate({
        path: "communities",
        model: "Community",
      });
    if (!user) {
      throw new Error(`User not found with id: ${userId}`);
    }
    return user;
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

/**
 * Fetches a list of users from a database based on certain criteria.
 * 
 * @param {Object} options - The options for fetching users.
 * @param {string} options.userId - The ID of the current user.
 * @param {string} [options.searchString=""] - A search string to filter the users by username or name.
 * @param {number} [options.pageNumber=1] - The page number of the results.
 * @param {number} [options.pageSize=20] - The number of users to fetch per page.
 * @param {SortOrder} [options.sortOrder="desc"] - The sort order of the results (either "asc" or "desc").
 * @returns {Promise<Object>} - An object containing the fetched users and a boolean value indicating whether there are more users to fetch.
 * @throws {Error} - If there is an error fetching the users.
 */
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

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };
    
    if (searchString.trim() !== "") {
      const regex = new RegExp(searchString, "i");
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

    const [totalUsersCount, users] = await Promise.all([
      User.countDocuments(query),
      usersQuery.exec(),
    ]);

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext }

  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

/**
 * Retrieves the replies of a user's threads from a database.
 * 
 * @param {string} userId - The ID of the user whose activity is being fetched.
 * @returns {Promise<Array<Object>>} - An array of thread objects representing the replies to the user's threads.
 * Each reply object includes the author's name, image, and ID.
 * @throws {Error} - If there is an error fetching the user's activity.
 */
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
    }).lean(); // https://mongoosejs.com/docs/tutorials/lean.html#when-to-use-lean to fix error: Cannot read properties of undefined (reading 'wasPopulated')
  
    return replies;

  } catch (error: any) {
    throw new Error(`Failed to fetch the user's activity: ${error.message}`);
  }
}