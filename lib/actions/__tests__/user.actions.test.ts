/**
 * @jest-environment node
 */
import {
  connect,
  dropData,
  disconnect
} from '@/lib/testUtils/mongoMemoryServerHelper';
import User from "@/lib/models/user.model";
import { fetchUserThreads } from "../user.actions";
import Thread from '@/lib/models/thread.model';

let createdUser: any;

const mockThread01 = {
  content: 'Thread 1 Content',
  communityId: null,
  path: "/create-thread",
}

const mockThread02 = {
  content: 'Thread 2 Content',
  communityId: null,
  path: "/create-thread",
}

describe('user.actions', () => {
  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    createdUser = await User.create({
      id: '12345',
      name: 'some-name-12345',
      username: 'some-username-12345',
      bio: 'Some bio this is',
      profile_photo: '/profile-picture',
      onboarded: true,
      communities: null
    });
  });

  afterEach(async () => {
    await dropData();
  });

  afterAll(async () => {
    await disconnect();
  });

  describe('fetchUserThreads', () => {
    it('should return a correct object when the user ID is valid and threads field is not populated', async () => {
      const userId = "12345";
      const userWithThreads = await fetchUserThreads(userId);
      expect(userWithThreads.id).toBe('12345');
      expect(userWithThreads.name).toBe('some-name-12345');
      expect(userWithThreads.username).toBe('some-username-12345');
      expect(userWithThreads.threads).toBeDefined();
      expect(userWithThreads.threads.length).toBe(0);
    });

    it('should return a correct object when the user ID is valid and threads field is populated', async () => {
      await Promise.all([
        await Thread.create({
          ...mockThread01,
          author: createdUser._id,
        }),
        await Thread.create({
          ...mockThread02,
          author: createdUser._id,
        })
      ]).then((values) => {
        return User.findByIdAndUpdate(createdUser._id, {
          $push: {
            threads: values.map((thread) => thread._id)
          },
        });
      });
      const userId = "12345";
      const userWithThreads = await fetchUserThreads(userId);
      expect(userWithThreads.id).toBe('12345');
      expect(userWithThreads.name).toBe('some-name-12345');
      expect(userWithThreads.username).toBe('some-username-12345');
      expect(userWithThreads.threads).toBeDefined();
      expect(userWithThreads.threads.length).toBe(2);
    });

    it('should return null when the user ID is not found in the database', async () => {
      const userId = "1234";
      const result = await fetchUserThreads(userId);
      expect(result).toBeNull();
    });

    it("should throw an error if there is an error while fetching the user's threads", async () => {
      const userId = "12345";
      const errorMessage = "Failed to fetch user's threads";
      jest.spyOn(User, 'populate').mockRejectedValue(new Error(errorMessage));
      await expect(fetchUserThreads(userId)).rejects.toThrow(errorMessage);
    });
  });
});
