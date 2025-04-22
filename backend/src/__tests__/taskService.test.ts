import { TaskService } from '../services/taskService';
import { createTestUser, createTestProject, createTestTask, cleanupTestData } from './helpers';
import { ValidationError, NotFoundError } from '../lib/errors';

describe('TaskService', () => {
  let taskService: TaskService;
  let testUser: any;
  let testProject: any;

  beforeAll(async () => {
    taskService = new TaskService();
    testUser = await createTestUser();
    testProject = await createTestProject(testUser.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        task_group_id: testProject.id,
        title: 'Test Task'
      };

      const task = await taskService.createTask(taskData);

      expect(task).toHaveProperty('id');
      expect(task.task_group_id).toBe(testProject.id);
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe('todo');
      expect(task.order).toBe(0);
    });

    it('should throw ValidationError when required fields are missing', async () => {
      await expect(taskService.createTask({} as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      const task = await createTestTask(testProject.id);
      const foundTask = await taskService.getTaskById(task.id);

      expect(foundTask).toEqual(task);
    });

    it('should throw NotFoundError when task does not exist', async () => {
      await expect(taskService.getTaskById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getTasksByGroupId', () => {
    it('should return all tasks for a task group', async () => {
      const task1 = await createTestTask(testProject.id, 'Task 1');
      const task2 = await createTestTask(testProject.id, 'Task 2');

      const tasks = await taskService.getTasksByGroupId(testProject.id);

      expect(tasks).toHaveLength(2);
      expect(tasks).toEqual(expect.arrayContaining([task1, task2]));
    });

    it('should return empty array when task group has no tasks', async () => {
      const tasks = await taskService.getTasksByGroupId(testProject.id);
      expect(tasks).toHaveLength(0);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const task = await createTestTask(testProject.id);
      const updatedData = {
        title: 'Updated Task Title'
      };

      const updatedTask = await taskService.updateTask(task.id, updatedData);

      expect(updatedTask.title).toBe('Updated Task Title');
    });

    it('should throw NotFoundError when task does not exist', async () => {
      await expect(
        taskService.updateTask('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const task = await createTestTask(testProject.id);
      await taskService.deleteTask(task.id);

      await expect(taskService.getTaskById(task.id)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when task does not exist', async () => {
      await expect(taskService.deleteTask('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const task = await createTestTask(testProject.id);
      const updatedTask = await taskService.updateTaskStatus(task.id, 'in_progress');

      expect(updatedTask.status).toBe('in_progress');
    });

    it('should throw NotFoundError when task does not exist', async () => {
      await expect(
        taskService.updateTaskStatus('non-existent-id', 'in_progress')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when status is invalid', async () => {
      const task = await createTestTask(testProject.id);
      await expect(
        taskService.updateTaskStatus(task.id, 'invalid_status' as any)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateTaskOrder', () => {
    it('should update task order', async () => {
      const task1 = await createTestTask(testProject.id, 'Task 1');
      const task2 = await createTestTask(testProject.id, 'Task 2');
      const task3 = await createTestTask(testProject.id, 'Task 3');

      await taskService.updateTaskOrder(testProject.id, [task3.id, task2.id, task1.id]);

      const tasks = await taskService.getTasksByGroupId(testProject.id);
      expect(tasks[0].id).toBe(task3.id);
      expect(tasks[1].id).toBe(task2.id);
      expect(tasks[2].id).toBe(task1.id);
    });

    it('should throw ValidationError when taskIds is not an array', async () => {
      await expect(
        taskService.updateTaskOrder(testProject.id, 'not-an-array' as any)
      ).rejects.toThrow(ValidationError);
    });
  });
}); 