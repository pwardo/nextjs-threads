/**
 * @jest-environment node
 */
import {
  connect,
  dropData,
  disconnect
} from '@/lib/testUtils/mongoMemoryServerHelper';
import User from "@/lib/models/user.model";
import { fetchUser, fetchUserThreads, fetchUsers, getActivity, updateUser } from "../user.actions";
import Thread from '@/lib/models/thread.model';
import Community from '@/lib/models/community.model';

describe('user.actions', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await dropData();
  });
  
  afterAll(async () => {
    await disconnect();
  });
  
  describe('fetchUserThreads', () => {
    let user: any;

    beforeEach(async () => {
      user = await User.create({
        id: '12345',
        name: 'some-name-12345',
        username: 'some-username-12345',
        bio: 'Some bio this is',
        profile_photo: '/profile-picture',
        onboarded: true,
        communities: []
      });
    });

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
        Thread.create({
          content: 'Thread 1 Content',
          communityId: null,
          path: "/create-thread",
          author: user._id,
        }),
        Thread.create({
          content: 'Thread 2 Content',
          communityId: null,
          path: "/create-thread",
          author: user._id,
        })
      ]).then((values) => {
        return User.findByIdAndUpdate(user._id, {
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
      const mockPopulate = jest.spyOn(User, 'populate');
      mockPopulate.mockRejectedValue(new Error(errorMessage));
      await expect(fetchUserThreads(userId)).rejects.toThrow(errorMessage);
      mockPopulate.mockRestore();
    });
  });

  describe('fetchUser', () => {
    let user: any;

    beforeEach(async () => {
      user = await User.create({
        id: '123456',
        name: 'some-name-123456',
        username: 'some-username-123456',
        bio: 'Some bio this is',
        profile_photo: '/profile-picture',
        onboarded: true,
        communities: []
      });
    });

    it('should return a user object when given a valid userId', async () => {
      const userId = '123456';
      const user = await fetchUser(userId);
      expect(user.id).toBe('123456');
      expect(user.name).toBe('some-name-123456');
      expect(user.username).toBe('some-username-123456');
      expect(user.threads).toBeDefined();
      expect(user.threads.length).toBe(0);
    });

    it('should populate the communities field of the user object', async () => {
      const mockCommunity01 = {
        id: '111',
        name: 'Community 1 - Nature',
        username: 'beautiful-nature',
        image: '/community-image',
        bio: 'Community 1 bio',
        createdBy: user._id,
      }
      const mockCommunity02 = {
        id: '222',
        name: 'Community 2 - Architecture',
        username: 'beautiful-architecture',
        image: '/community-image',
        bio: 'Community 1 bio',
        createdBy: user._id,
      }

      await Promise.all([
        Community.create({
          ...mockCommunity01,
          createdBy: user._id,
        }),
        Community.create({
          ...mockCommunity02,
          createdBy: user._id,
        })
      ]).then((values) => {
        return User.findByIdAndUpdate(user._id, {
          $push: {
            communities: values.map((community) => community._id)
          },
        });
      });

      const userWithCommunities = await fetchUser(user.id);
      expect(userWithCommunities.id).toBe('123456');
      expect(userWithCommunities.name).toBe('some-name-123456');
      expect(userWithCommunities.username).toBe('some-username-123456');
      expect(userWithCommunities.communities).toBeDefined();
      expect(userWithCommunities.communities.length).toBe(2);
    });

    it('should throw an error if the user is not found with the specified ID', async () => {
      const userId = 'user-does-not-exit';
      await expect(fetchUser(userId)).rejects.toThrowError(`User not found with id: ${userId}`);
    });

    it('should throw an error when userId is an empty string', async () => {
      const userId = '';
      await expect(fetchUser(userId)).rejects.toThrowError(`User not found with id: ${userId}`);
    });

    it("should throw an error if there is an error fetching the user", async () => {
      const userId = "12345";
      const errorMessage = "Failed to fetch user";
      const mockPopulate = jest.spyOn(User, 'populate');
      mockPopulate.mockRejectedValue(new Error(errorMessage));
      await expect(fetchUser(userId)).rejects.toThrow(errorMessage);
      mockPopulate.mockRestore();
    });
  });

  describe('fetchUsers', () => {
    describe('--- Using Mongo Memory Server ---', () => {
      let user01: any;
      let user02: any;
      let user03: any;

      beforeEach(async () => {
        user01 = await User.create({
          id: '111',
          name: 'some-name-111',
          username: 'some-username-111',
          bio: 'Some bio this is 111',
          profile_photo: '/profile-picture',
          onboarded: true,
          communities: []
        }),
        user02 = await User.create({
          id: '222',
          name: 'some-name-222',
          username: 'some-username-222',
          bio: 'Some bio this is 222',
          profile_photo: '/profile-picture',
          onboarded: true,
          communities: []
        }),
        user03 = await User.create({
          id: '333',
          name: 'some-name-333',
          username: 'some-username-333',
          bio: 'Some bio this is 333',
          profile_photo: '/profile-picture',
          onboarded: true,
          communities: []
        });
      });

      it('should return a list of users and a boolean indicating if there are more users to fetch', async () => {
        const result = await fetchUsers({ userId: '000' });
        const user01 = result.users[0];
        const user02 = result.users[1];
        const user03 = result.users[2];

        expect(user01.id).toBe(user01.id);
        expect(user01.name).toBe(user01.name);
        expect(user01.username).toBe(user01.username);
        expect(user01.bio).toBe(user01.bio);

        expect(user02.id).toBe(user02.id);
        expect(user02.name).toBe(user02.name);
        expect(user02.username).toBe(user02.username);
        expect(user02.bio).toBe(user02.bio);

        expect(user03.id).toBe(user03.id);
        expect(user03.name).toBe(user03.name);
        expect(user03.username).toBe(user03.username);
        expect(user03.bio).toBe(user03.bio);

        expect(result.isNext).toBe(false);
      });
  
      it('should exclude the current user from the results', async () => {
        const result = await fetchUsers({ userId: '111' });
        const userIds = result.users.map((user) => user.id);
        expect(userIds).not.toContain('111');
      });
  
      it('should filter users by username or name if a search string is provided', async () => {
        const result = await fetchUsers({ userId: 'user1', searchString: '333' });
        const usernames = result.users.map((user) => user.username);
        expect(usernames).toContain('some-username-333');
        expect(usernames).not.toContain('some-username-222');
        expect(usernames).not.toContain('some-username-111');
      });
  
      it('should handle empty search string (should ignore the empty searchString)', async () => {
        const result = await fetchUsers({ userId: 'user1', searchString: '' });
        const usernames = result.users.map((user) => user.username);
        expect(usernames).toContain('some-username-111');
        expect(usernames).toContain('some-username-222');
        expect(usernames).toContain('some-username-333');
      });
  
      it('should handle non-existent userId', async () => {
        const result = await fetchUsers({ userId: '' });
        const usernames = result.users.map((user) => user.username);
        expect(usernames.length).toBe(3)
        expect(usernames).toContain('some-username-111');
        expect(usernames).toContain('some-username-222');
        expect(usernames).toContain('some-username-333');
      });
    });

    describe('--- Fully Mocked Tests ---', () => {
      let mockUser;
      let mockUsers: any;
      let mockCount;
      let mockReturn: any;
      let mockUserFind: any;
      let mockUserCountDocuments: any;

      beforeEach(() => {        
        mockUser = { id: 'user1', username: 'user1', name: 'User 1' };
        mockUsers = [mockUser];
        mockCount = 1;
        mockReturn = {
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockUsers),
        }
        mockUserFind = jest.spyOn(User, 'find').mockReturnValue(mockReturn as any);
        mockUserCountDocuments = jest.spyOn(User, 'countDocuments').mockResolvedValue(mockCount);
      })

      it('should return a list of users and a boolean indicating if there are more users to fetch', async () => {
        const result = await fetchUsers({ userId: 'user1' });
  
        expect(mockUserFind).toHaveBeenCalledWith({ id: { $ne: 'user1' } });
        expect(mockUserFind().sort).toHaveBeenCalledWith({ createdAt: 'desc' });
        expect(mockUserFind().skip).toHaveBeenCalledWith(0);
        expect(mockUserFind().limit).toHaveBeenCalledWith(20);
        expect(mockUserFind().exec).toHaveBeenCalled();
        expect(mockUserCountDocuments).toHaveBeenCalledWith({ id: { $ne: 'user1' } });
        expect(result.users).toEqual(mockUsers);
        expect(result.isNext).toBe(false);
      });
  
      it('should exclude the current user from the results', async () => {
        await fetchUsers({ userId: 'user1' });
  
        expect(mockUserFind).toHaveBeenCalledWith({ id: { $ne: 'user1' } });
        expect(mockUserCountDocuments).toHaveBeenCalledWith({ id: { $ne: 'user1' } });
      });
  
      it('should filter users by username or name if a search string is provided', async () => {
        await fetchUsers({ userId: 'user1', searchString: 'user' });
  
        expect(mockUserFind).toHaveBeenCalledWith({
          id: { $ne: 'user1' },
          $or: [
            { username: { $regex: /user/i } },
            { name: { $regex: /user/i } },
          ],
        });
        expect(mockUserCountDocuments).toHaveBeenCalledWith({
          id: { $ne: 'user1' },
          $or: [
            { username: { $regex: /user/i } },
            { name: { $regex: /user/i } },
          ],
        });
      });
  
      it('should throw an error if there is an error connecting to the database', async () => {
        const mockError = new Error('Failed to connect to database');
  
        let mockReturnWithError = {
          ...mockReturn,
          exec: jest.fn().mockRejectedValue(mockError)
        }

        jest.spyOn(User, 'find').mockReturnValue(mockReturnWithError as any);
  
        expect(async () => { await fetchUsers({ userId: 'user1' }) }).rejects.toThrowError(
          `Failed to fetch users: ${mockError.message}`
        );
      });
  
      it('should handle empty search string', async () => {
        await fetchUsers({ userId: 'user1', searchString: '' });
        expect(mockUserFind).toHaveBeenCalledWith({ id: { $ne: 'user1' } });
        expect(mockUserCountDocuments).toHaveBeenCalledWith({ id: { $ne: 'user1' } });
      });
  
      it('should handle non-existent userId', async () => {
        const mockUser = { id: 'user1', username: 'user1', name: 'User 1' };
        const mockUsers = [mockUser];
        const mockCount = 1;
  
        const mockUserFind = jest.spyOn(User, 'find').mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockUsers),
        } as any);
  
        const mockUserCountDocuments = jest.spyOn(User, 'countDocuments').mockResolvedValue(mockCount);
  
        await fetchUsers({ userId: 'nonexistent' });
  
        expect(mockUserFind).toHaveBeenCalledWith({ id: { $ne: 'nonexistent' } });
        expect(mockUserCountDocuments).toHaveBeenCalledWith({ id: { $ne: 'nonexistent' } });
      });
    });
  });

  describe('getActivity', () => {
    let user01: any;
    let user02: any;
    let thread01: any;
    let reply01: any;
    let reply02: any;
    let replyByThreadAuthor: any;

    beforeEach(async () => {
      user01 = await User.create({
        id: '111',
        name: 'some-name-111',
        username: 'some-username-111',
        bio: 'Some bio this is 111',
        profile_photo: '/profile-picture',
        onboarded: true,
        communities: []
      });
      user02 = await User.create({
        id: '222',
        name: 'some-name-222',
        username: 'some-username-222',
        bio: 'Some bio this is 222',
        profile_photo: '/profile-picture',
        onboarded: true,
        communities: []
      });

      thread01 = await Thread.create({
        content: 'Thread 1 Content',
        communityId: null,
        path: "/create-thread",
        author: user01._id,
      });

      reply01 = await Thread.create({
        content: 'Reply to Thread 1',
        communityId: null,
        path: "/create-thread",
        author: user02._id,
        parentId: thread01._id
      });

      reply02 = await Thread.create({
        content: 'Another Reply to Thread 1',
        communityId: null,
        path: "/create-thread",
        author: user02._id,
        parentId: thread01._id
      });

      replyByThreadAuthor = await Thread.create({
        content: 'Another Reply to Thread 1',
        communityId: null,
        path: "/create-thread",
        author: user01._id,
        parentId: thread01._id
      });
  
      // Add the comment thread's ID to the original thread's children array
      thread01.children.push(reply01._id);
      thread01.children.push(reply02._id);
      thread01.children.push(replyByThreadAuthor._id);
      await thread01.save();
    });

    it('should return an array of child threads excluding ones created by the same user', async () => {
      const result = await getActivity(user01._id);
      const replyIds = result.map((reply) => reply._id);
      expect(replyIds).toContainEqual(reply01._id);
      expect(replyIds).toContainEqual(reply02._id);
      expect(replyIds).not.toContainEqual(replyByThreadAuthor._id);
    });

    // TODO: figure out why it's not populating author
   xit('should populate the author field of each child thread with name, image and _id', async () => {
      const result = await getActivity(user01);
  
      console.log("result::: ", result);

      const authors = result.map((reply) => reply.author);
      expect(authors).toContainEqual(user01._id);
    });
  });

  // TODO: 
  // revalidatePath from 'next/cache' is throwing and error
  // Error: Invariant: static generation store missing in revalidateTag _N_T_/profile/edit
  // Need to find a way to mock revalidatePath and revalidateTag
  xdescribe('updateUser', () => {
    jest.mock('next/cache', () => ({
      revalidatePath() {
        return jest.fn().mockResolvedValue(null);
      },
      revalidateTag() {
        return jest.fn().mockResolvedValue(null);
      },
    }));

    it('should update user\'s information in the database', async () => {
      const userId = '123';
      const bio = 'New bio';
      const name = 'New name';
      const path = '/profile/edit';
      const username = 'newusername';
      const image = 'newimageurl';

      await updateUser({ userId, bio, name, path, username, image });

      const updatedUser = await User.findOne({ id: userId });
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.bio).toBe(bio);
      expect(updatedUser?.name).toBe(name);
      expect(updatedUser?.username).toBe(username.toLowerCase());
      expect(updatedUser?.image).toBe(image);
    });

    xit('should create a new document if user does not exist', async () => {
      const userId = '456';
      const bio = 'New bio';
      const name = 'New name';
      const path = '/profile/edit';
      const username = 'newusername';
      const image = 'newimageurl';

      await updateUser({ userId, bio, name, path, username, image });

      const newUser = await User.findOne({ id: userId });
      expect(newUser).toBeDefined();
      expect(newUser?.bio).toBe(bio);
      expect(newUser?.name).toBe(name);
      expect(newUser?.username).toBe(username.toLowerCase());
      expect(newUser?.image).toBe(image);
    });

    // Calls revalidatePath function if path is "/profile/edit".
    xit('should call revalidatePath function if path is "/profile/edit"', async () => {
      const userId = '123';
      const bio = 'New bio';
      const name = 'New name';
      const path = '/profile/edit';
      const username = 'newusername';
      const image = 'newimageurl';
      const revalidatePathMock = jest.fn();

      jest.mock("next/cache", () => ({
        revalidatePath: revalidatePathMock,
      }));
      await updateUser({ userId, bio, name, path, username, image });

      expect(revalidatePathMock).toHaveBeenCalledWith(path);
    });

    // Throws an error if failed to create/update user.
    xit('should throw an error if failed to create/update user', async () => {
      
      const userId = '123';
      const bio = 'New bio';
      const name = 'New name';
      const path = '/profile/edit';
      const username = 'newusername';
      const image = 'newimageurl';
      const errorMessage = 'Failed to create/update user';
      const findOneAndUpdateMock = jest.spyOn(User, 'findOneAndUpdate').mockRejectedValue(new Error(errorMessage));

      await expect(updateUser({ userId, bio, name, path, username, image })).rejects.toThrowError(errorMessage);

      // Clean up
      findOneAndUpdateMock.mockRestore();
    });

    // Handles empty bio, name, and image fields.
    xit('should handle empty bio, name, and image fields', async () => {
      const userId = '123';
      const bio = '';
      const name = '';
      const path = '/profile/edit';
      const username = 'newusername';
      const image = '';
      const expectedBio = null;
      const expectedName = null;
      const expectedImage = null;

      await updateUser({ userId, bio, name, path, username, image });

      const updatedUser = await User.findOne({ id: userId });
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.bio).toBe(expectedBio);
      expect(updatedUser?.name).toBe(expectedName);
      expect(updatedUser?.image).toBe(expectedImage);
    });

    // Tests if user's information is updated correctly.
    xit('should update user\'s information correctly', async () => {
      const userId = '123';
      const bio = 'New bio';
      const name = 'New name';
      const path = '/profile/edit';
      const username = 'newusername';
      const image = 'newimageurl';

      await updateUser({ userId, bio, name, path, username, image });

      const updatedUser = await User.findOne({ id: userId });
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.bio).toBe(bio);
      expect(updatedUser?.name).toBe(name);
      expect(updatedUser?.username).toBe(username.toLowerCase());
      expect(updatedUser?.image).toBe(image);
    });
  });
});
