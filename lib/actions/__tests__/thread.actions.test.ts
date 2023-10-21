/**
 * @jest-environment node
 */
import Thread from "@/lib/models/thread.model";
import { fetchThreadById, fetchThreads } from "../thread.actions";
import User from "@/lib/models/user.model";
import { connect, disconnect, dropData } from "@/lib/testUtils/mongoMemoryServerHelper";
import { faker } from '@faker-js/faker';

describe('thread.actions', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await dropData();
  });
  
  afterAll(async () => {
    await disconnect();
  });

  describe('fetchThreads', () => {
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

    it('should fetch threads with default parameters', async () => {
      const thread01 = await Thread.create({
        content: 'Thread 1 Content',
        communityId: null,
        path: "/create-thread",
        author: user._id,
      });
      const thread02 = await Thread.create({
        content: 'Thread 2 Content',
        communityId: null,
        path: "/create-thread",
        author: user._id,
      });

      User.findByIdAndUpdate(user._id, {
        $push: {
          threads: [thread02, thread01].map((thread) => thread._id)
        },
      });

      const result = await fetchThreads();
      expect(result.threads[0].content).toBe(thread02.content);
      expect(result.threads[1].content).toBe(thread01.content);
      expect(result.isNextPageAvailable).toBe(false);
    });

    it('should fetch threads with pagination parameters', async () => {
      const threadsArray = []
      for(let step = 0; step < 25; step++) {
        threadsArray.push(
          Thread.create({
            content: faker.lorem.lines({ min: 1, max: 5 }),
            communityId: null,
            path: "/create-thread",
            author: user._id,
          })
        )
      }
      await Promise.all(threadsArray).then((values) => {
        User.findByIdAndUpdate(user._id, {
          $push: {
            threads: values.map((thread) => thread._id)
          },
        });
        return values;
      });

      const result = await fetchThreads(2, 5);
      expect(result.threads.length).toBe(5);
      expect(result.isNextPageAvailable).toBe(true);

      const lastPage = await fetchThreads(3, 10);
      expect(lastPage.threads.length).toBe(5);
      expect(lastPage.isNextPageAvailable).toBe(false);
    });

    it('should handle an empty database and return the correct isNextPageAvailable flag', async () => {
      const result = await fetchThreads();
      expect(result.threads.length).toBe(0);
      expect(result.isNextPageAvailable).toBe(false);
    });

    it('should handle a single thread and return the correct isNextPageAvailable flag', async () => {
      await Thread.create({
        content: 'Thread 1 Content',
        communityId: null,
        path: "/create-thread",
        author: user._id,
      });
      const result = await fetchThreads();
      expect(result.threads.length).toBe(1);
      expect(result.isNextPageAvailable).toBe(false);
    });
  });

  describe('fetchThreadById', () => {
    let user01: any;
    let user02: any;
    let thread01: any;
    let thread02: any;

    beforeEach(async () => {
      user01 = await User.create({
        id: '11111',
        name: 'some-name-11111',
        username: 'some-username-11111',
        bio: 'Some bio this is',
        profile_photo: '/profile-picture',
        onboarded: true,
        communities: []
      });
      user02 = await User.create({
        id: '22222',
        name: 'some-name-22222',
        username: 'some-username-22222',
        bio: 'Some bio this is',
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
      thread02 = await Thread.create({
        content: 'Reply to Thread 1',
        communityId: null,
        path: "/create-thread",
        author: user02._id,
        parentId: thread01._id
      });
      thread01.children.push(thread02._id);
      await thread01.save();
      await User.findByIdAndUpdate(user02._id, {
        $push: {
          threads: thread02._id
        },
      });
    });
    
    it('should fetch a thread by its ID from the database', async () => {
      const result = await fetchThreadById(thread01);
      expect(result._id).toEqual(thread01._id);
    });
    
    it('should populate the author field of the thread object with additional information from the related User model', async () => {
      const result = await fetchThreadById(thread01);
      expect(result._id).toEqual(thread01._id);
      expect(result.content).toEqual(thread01.content);
      expect(result.author._id).toEqual(user01._id);
      expect(result.author.id).toEqual(user01.id);
      expect(result.author.name).toEqual(user01.name);
    });

    it('should populate the children field of the thread object with additional information from the related Thread model', async () => {
      const result = await fetchThreadById(thread01);
      expect(result._id).toEqual(thread01._id);
      expect(result.children[0]._id).toEqual(thread02._id);
      expect(result.children[0].content).toEqual(thread02.content);
      expect(result.children[0].parentId).toBe(thread02.parentId);
    });

    it('should populate the author field within children of the thread object with additional information from the related User model', async () => {
      const result = await fetchThreadById(thread01);
      expect(result._id).toEqual(thread01._id);
      expect(result.children[0].author._id).toEqual(user02._id);
      expect(result.children[0].author.id).toEqual(user02.id);
      expect(result.children[0].author.name).toEqual(user02.name);
    });
  });
});