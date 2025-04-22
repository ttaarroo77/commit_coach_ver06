import { SubtaskService } from '../services/subtaskService';
import {
  createTestUser,
  createTestProject,
  createTestTask,
  createTestSubtask,
  cleanupTestData
} from './helpers';
import { ValidationError, NotFoundError } from '../lib/errors';

describe('SubtaskService', () => {
  let subtaskService: SubtaskService;
  let testUser: any;
  let testProject: any;
  let testTask: any;

  beforeAll(async () => {
    subtaskService = new SubtaskService();
    testUser = await createTestUser();
    testProject = await createTestProject(testUser.id);
    testTask = await createTestTask(testProject.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('createSubtask', () => {
    it('should create a new subtask', async () => {
      const subtaskData = {
        task_id: testTask.id,
        title: 'Test Subtask'
      };

      const subtask = await subtaskService.createSubtask(subtaskData);

      expect(subtask).toHaveProperty('id');
      expect(subtask.task_id).toBe(testTask.id);
      expect(subtask.title).toBe('Test Subtask');
      expect(subtask.is_completed).toBe(false);
      expect(subtask.order).toBe(0);
    });

    it('should throw ValidationError when required fields are missing', async () => {
      await expect(subtaskService.createSubtask({} as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('getSubtaskById', () => {
    it('should return a subtask by id', async () => {
      const subtask = await createTestSubtask(testTask.id);
      const foundSubtask = await subtaskService.getSubtaskById(subtask.id);

      expect(foundSubtask).toEqual(subtask);
    });

    it('should throw NotFoundError when subtask does not exist', async () => {
      await expect(subtaskService.getSubtaskById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getSubtasksByTaskId', () => {
    it('should return all subtasks for a task', async () => {
      const subtask1 = await createTestSubtask(testTask.id, 'Subtask 1');
      const subtask2 = await createTestSubtask(testTask.id, 'Subtask 2');

      const subtasks = await subtaskService.getSubtasksByTaskId(testTask.id);

      expect(subtasks).toHaveLength(2);
      expect(subtasks).toEqual(expect.arrayContaining([subtask1, subtask2]));
    });

    it('should return empty array when task has no subtasks', async () => {
      const subtasks = await subtaskService.getSubtasksByTaskId(testTask.id);
      expect(subtasks).toHaveLength(0);
    });
  });

  describe('updateSubtask', () => {
    it('should update a subtask', async () => {
      const subtask = await createTestSubtask(testTask.id);
      const updatedData = {
        title: 'Updated Subtask Title'
      };

      const updatedSubtask = await subtaskService.updateSubtask(subtask.id, updatedData);

      expect(updatedSubtask.title).toBe('Updated Subtask Title');
    });

    it('should throw NotFoundError when subtask does not exist', async () => {
      await expect(
        subtaskService.updateSubtask('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteSubtask', () => {
    it('should delete a subtask', async () => {
      const subtask = await createTestSubtask(testTask.id);
      await subtaskService.deleteSubtask(subtask.id);

      await expect(subtaskService.getSubtaskById(subtask.id)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when subtask does not exist', async () => {
      await expect(subtaskService.deleteSubtask('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('toggleSubtaskCompletion', () => {
    it('should toggle subtask completion status', async () => {
      const subtask = await createTestSubtask(testTask.id);
      const toggledSubtask = await subtaskService.toggleSubtaskCompletion(subtask.id);

      expect(toggledSubtask.is_completed).toBe(true);

      const toggledAgainSubtask = await subtaskService.toggleSubtaskCompletion(subtask.id);
      expect(toggledAgainSubtask.is_completed).toBe(false);
    });

    it('should throw NotFoundError when subtask does not exist', async () => {
      await expect(
        subtaskService.toggleSubtaskCompletion('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateSubtaskOrder', () => {
    it('should update subtask order', async () => {
      const subtask1 = await createTestSubtask(testTask.id, 'Subtask 1');
      const subtask2 = await createTestSubtask(testTask.id, 'Subtask 2');
      const subtask3 = await createTestSubtask(testTask.id, 'Subtask 3');

      await subtaskService.updateSubtaskOrder(testTask.id, [subtask3.id, subtask2.id, subtask1.id]);

      const subtasks = await subtaskService.getSubtasksByTaskId(testTask.id);
      expect(subtasks[0].id).toBe(subtask3.id);
      expect(subtasks[1].id).toBe(subtask2.id);
      expect(subtasks[2].id).toBe(subtask1.id);
    });

    it('should throw ValidationError when subtaskIds is not an array', async () => {
      await expect(
        subtaskService.updateSubtaskOrder(testTask.id, 'not-an-array' as any)
      ).rejects.toThrow(ValidationError);
    });
  });
}); 