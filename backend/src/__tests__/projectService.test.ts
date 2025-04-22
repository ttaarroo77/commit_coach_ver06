import { ProjectService } from '../services/projectService';
import { createTestUser, createTestProject, cleanupTestData } from './helpers';
import { ValidationError, NotFoundError } from '../lib/errors';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let testUser: any;

  beforeAll(async () => {
    projectService = new ProjectService();
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const projectData = {
        user_id: testUser.id,
        title: 'Test Project'
      };

      const project = await projectService.createProject(projectData);

      expect(project).toHaveProperty('id');
      expect(project.user_id).toBe(testUser.id);
      expect(project.title).toBe('Test Project');
      expect(project.is_active).toBe(true);
    });

    it('should throw ValidationError when required fields are missing', async () => {
      await expect(projectService.createProject({} as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('getProjectById', () => {
    it('should return a project by id', async () => {
      const project = await createTestProject(testUser.id);
      const foundProject = await projectService.getProjectById(project.id);

      expect(foundProject).toEqual(project);
    });

    it('should throw NotFoundError when project does not exist', async () => {
      await expect(projectService.getProjectById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getProjectsByUserId', () => {
    it('should return all projects for a user', async () => {
      const project1 = await createTestProject(testUser.id, 'Project 1');
      const project2 = await createTestProject(testUser.id, 'Project 2');

      const projects = await projectService.getProjectsByUserId(testUser.id);

      expect(projects).toHaveLength(2);
      expect(projects).toEqual(expect.arrayContaining([project1, project2]));
    });

    it('should return empty array when user has no projects', async () => {
      const projects = await projectService.getProjectsByUserId(testUser.id);
      expect(projects).toHaveLength(0);
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const project = await createTestProject(testUser.id);
      const updatedData = {
        title: 'Updated Project Title'
      };

      const updatedProject = await projectService.updateProject(project.id, updatedData);

      expect(updatedProject.title).toBe('Updated Project Title');
    });

    it('should throw NotFoundError when project does not exist', async () => {
      await expect(
        projectService.updateProject('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const project = await createTestProject(testUser.id);
      await projectService.deleteProject(project.id);

      await expect(projectService.getProjectById(project.id)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when project does not exist', async () => {
      await expect(projectService.deleteProject('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getActiveProjectsByUserId', () => {
    it('should return only active projects for a user', async () => {
      const activeProject = await createTestProject(testUser.id, 'Active Project');
      const inactiveProject = await createTestProject(testUser.id, 'Inactive Project');
      await projectService.updateProject(inactiveProject.id, { is_active: false });

      const activeProjects = await projectService.getActiveProjectsByUserId(testUser.id);

      expect(activeProjects).toHaveLength(1);
      expect(activeProjects[0].id).toBe(activeProject.id);
    });
  });
});