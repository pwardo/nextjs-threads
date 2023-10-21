/**
 * @jest-environment node
 */
import {
  connect,
  dropData,
  disconnect
} from '@/lib/testUtils/mongoMemoryServerHelper';
import User from "@/lib/models/user.model";
import Community from '@/lib/models/community.model';
import { createCommunity } from '../community.actions';

describe('community.actions', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await dropData();
  });
  
  afterAll(async () => {
    await disconnect();
  });

  describe('createCommunity', () => {
    let user01: any;
    let community01: any;

    beforeEach(async () => {
      user01 = await User.create({
        id: '1111',
        name: 'some-name-111',
        username: 'some-username-111',
        bio: 'Some bio this is',
        profile_photo: '/profile-picture',
        onboarded: true,
        communities: []
      });

      community01 = await createCommunity(
        '5555',
        'some-name-5555',
        'community-5555-username',
        'Bio of Community 5555',
        '/community-5555-image',
        user01.id
      );
    });

    it('should create a new community when valid inputs are provided', async () => {
      const community = await Community.findOne({ createdBy: user01._id });
      expect(community01.id).toBe(community.id);
      expect(community01.name).toBe(community.name);
      expect(community01.username).toBe(community.username);
      expect(community01.image).toBe(community.image);
      expect(community01.bio).toBe(community.bio);
    });

    it('should add the new community ID to the user\'s list of communities', async () => {
      const community = await Community.findOne({ createdBy: user01._id });
      const user = await User.findOne({ _id: user01._id });
      expect(user.communities).toContainEqual(community._id);
    });

    it('should return the created community object', async () => {
      const id = '222';
      const name = 'some-name-222';
      const username = 'community-222-username';
      const image = '/community-222-image';
      const bio = 'Bio of Community 222';
      const createdById = user01.id;

      const result = await createCommunity(id, name, username, image, bio, createdById);

      expect(result.id).toBe(id);
      expect(result.name).toBe(name);
      expect(result.username).toBe(username);
      expect(result.image).toBe(image);
      expect(result.createdBy).toStrictEqual(user01._id);
    });

    // TODO: this is not implemented, setting unique in the model does not mean this is enforced
    xit('should throw an error if the provided ID is already in use by another community', async () => {
      const id = '5555';
      const name = 'some-name-5555';
      const username = 'community-5555-username';
      const image = '/community-5555-image';
      const bio = 'Bio of Community 5555';
      const createdById = user01.id;

      const result = await createCommunity(id, name, username, image, bio, createdById);

      expect(result.error).toBe('ID already in use');
    });
    
    // TODO: this is not implemented, setting unique in the model does not mean this is enforced
    xit('should throw an error if the provided name is already in use by another community', async () => {
      const id = '5555';
      const name = 'some-name-5555';
      const username = 'community-5555-username';
      const image = '/community-5555-image';
      const bio = 'Bio of Community 5555';
      const createdById = user01.id;

      const community = await Community.findOne({ createdBy: user01._id });
      // console.log("community:::", community);

      const result = await createCommunity(id, name, username, image, bio, createdById);
      // console.log("result:::", result);
      expect(result.error).toBe('Name already in use');
    });

    // TODO: this is not implemented, setting unique in the model does not mean this is enforced
    xit('should throw an error if the provided username is already in use by another community', async () => {
      const id = '5555';
      const name = 'some-name-5555';
      const username = 'community-5555-username';
      const image = '/community-5555-image';
      const bio = 'Bio of Community 5555';
      const createdById = user01.id;

      const community = await Community.findOne({ createdBy: user01._id });
      // console.log("community:::", community);

      const result = await createCommunity(id, name, username, image, bio, createdById);
      // console.log("result:::", result);
      expect(result.error).toBe('Username already in use');
    });
  });
});
