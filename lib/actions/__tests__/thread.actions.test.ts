/**
 * @jest-environment node
 */
import Thread from "@/lib/models/thread.model";
import { fetchThreads, IThread } from "../thread.actions";
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
      // console.log("threadsArray", threadsArray.length);
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

    // Should handle a single thread and return the correct isNextPageAvailable flag
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
});