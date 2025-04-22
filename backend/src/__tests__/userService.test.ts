import { UserService } from '../services/userService';
import { createTestUser, cleanupTestData } from './helpers';
import { ValidationError, NotFoundError } from '../lib/errors';

describe('UserService', () => {
  let userService: UserService;
  let testUser: any;

  beforeAll(async () => {
    userService = new UserService();
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const email = 'test2@example.com';
      const user = await userService.createUser({ email });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe(email);
    });

    it('should throw ValidationError when email is missing', async () => {
      await expect(userService.createUser({ email: '' })).rejects.toThrow(ValidationError);
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const user = await userService.getUserById(testUser.id);
      expect(user.id).toBe(testUser.id);
      expect(user.email).toBe(testUser.email);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      await expect(userService.getUserById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const user = await userService.getUserByEmail(testUser.email);
      expect(user.id).toBe(testUser.id);
      expect(user.email).toBe(testUser.email);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      await expect(userService.getUserByEmail('non-existent@example.com')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const newEmail = 'updated@example.com';
      const updatedUser = await userService.updateUser(testUser.id, { email: newEmail });
      expect(updatedUser.email).toBe(newEmail);
    });

    it('should throw ValidationError when email is missing', async () => {
      await expect(userService.updateUser(testUser.id, { email: '' })).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      await expect(
        userService.updateUser('non-existent-id', { email: 'test@example.com' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        await createTestUser('test1@example.com'),
        await createTestUser('test2@example.com')
      ];

      const allUsers = await userService.getAllUsers();
      expect(allUsers.map(u => u.email)).toEqual(expect.arrayContaining(users.map(u => u.email)));
    });
  });
}); 