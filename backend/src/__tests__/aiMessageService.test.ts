import { AIMessageService } from '../services/aiMessageService';
import {
  createTestUser,
  createTestProject,
  createTestAIMessage,
  cleanupTestData
} from './helpers';
import { ValidationError, NotFoundError } from '../lib/errors';

describe('AIMessageService', () => {
  let aiMessageService: AIMessageService;
  let testUser: any;
  let testProject: any;

  beforeAll(async () => {
    aiMessageService = new AIMessageService();
    testUser = await createTestUser();
    testProject = await createTestProject(testUser.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('createAIMessage', () => {
    it('should create a new AI message', async () => {
      const messageData = {
        user_id: testUser.id,
        project_id: testProject.id,
        role: 'user',
        content: 'Test Message'
      };

      const message = await aiMessageService.createAIMessage(messageData);

      expect(message).toHaveProperty('id');
      expect(message.user_id).toBe(testUser.id);
      expect(message.project_id).toBe(testProject.id);
      expect(message.role).toBe('user');
      expect(message.content).toBe('Test Message');
    });

    it('should throw ValidationError when required fields are missing', async () => {
      await expect(aiMessageService.createAIMessage({} as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('getAIMessageById', () => {
    it('should return an AI message by id', async () => {
      const message = await createTestAIMessage(testUser.id, testProject.id);
      const foundMessage = await aiMessageService.getAIMessageById(message.id);

      expect(foundMessage).toEqual(message);
    });

    it('should throw NotFoundError when message does not exist', async () => {
      await expect(aiMessageService.getAIMessageById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAIMessagesByUserId', () => {
    it('should return all AI messages for a user', async () => {
      const message1 = await createTestAIMessage(testUser.id, testProject.id, 'Message 1');
      const message2 = await createTestAIMessage(testUser.id, testProject.id, 'Message 2');

      const messages = await aiMessageService.getAIMessagesByUserId(testUser.id);

      expect(messages).toHaveLength(2);
      expect(messages).toEqual(expect.arrayContaining([message1, message2]));
    });

    it('should return empty array when user has no messages', async () => {
      const messages = await aiMessageService.getAIMessagesByUserId(testUser.id);
      expect(messages).toHaveLength(0);
    });
  });

  describe('getAIMessagesByProjectId', () => {
    it('should return all AI messages for a project', async () => {
      const message1 = await createTestAIMessage(testUser.id, testProject.id, 'Message 1');
      const message2 = await createTestAIMessage(testUser.id, testProject.id, 'Message 2');

      const messages = await aiMessageService.getAIMessagesByProjectId(testProject.id);

      expect(messages).toHaveLength(2);
      expect(messages).toEqual(expect.arrayContaining([message1, message2]));
    });

    it('should return empty array when project has no messages', async () => {
      const messages = await aiMessageService.getAIMessagesByProjectId(testProject.id);
      expect(messages).toHaveLength(0);
    });
  });

  describe('getRecentAIMessagesByUserId', () => {
    it('should return recent AI messages for a user', async () => {
      const message1 = await createTestAIMessage(testUser.id, testProject.id, 'Message 1');
      const message2 = await createTestAIMessage(testUser.id, testProject.id, 'Message 2');
      const message3 = await createTestAIMessage(testUser.id, testProject.id, 'Message 3');

      const messages = await aiMessageService.getRecentAIMessagesByUserId(testUser.id, 2);

      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe(message3.id);
      expect(messages[1].id).toBe(message2.id);
    });

    it('should return empty array when user has no messages', async () => {
      const messages = await aiMessageService.getRecentAIMessagesByUserId(testUser.id);
      expect(messages).toHaveLength(0);
    });
  });

  describe('deleteAIMessagesByProjectId', () => {
    it('should delete all AI messages for a project', async () => {
      await createTestAIMessage(testUser.id, testProject.id, 'Message 1');
      await createTestAIMessage(testUser.id, testProject.id, 'Message 2');

      await aiMessageService.deleteAIMessagesByProjectId(testProject.id);

      const messages = await aiMessageService.getAIMessagesByProjectId(testProject.id);
      expect(messages).toHaveLength(0);
    });

    it('should not throw error when project has no messages', async () => {
      await expect(
        aiMessageService.deleteAIMessagesByProjectId(testProject.id)
      ).resolves.not.toThrow();
    });
  });
}); 