import { StudentService } from '../../services/student.service';
import { AppDataSource } from '../../config/database';
import { Student } from '../../models/Student';
import { StudentGuardian } from '../../models/StudentGuardian';

// Mock the database
jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('StudentService - Detailed Tests', () => {
  let studentService: StudentService;
  let mockStudentRepository: any;
  let mockStudentGuardianRepository: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock repositories
    mockStudentRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    mockStudentGuardianRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    // Mock AppDataSource
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity: any) => {
      if (entity === Student || entity.name === 'Student') {
        return mockStudentRepository;
      }
      if (entity === StudentGuardian || entity.name === 'StudentGuardian') {
        return mockStudentGuardianRepository;
      }
      return null;
    });

    studentService = new StudentService();
  });

  describe('getStudentById', () => {
    it('should return a student by ID', async () => {
      const mockStudent = { id: '123', firstName: 'John', lastName: 'Doe' };
      mockStudentRepository.findOne.mockResolvedValue(mockStudent);

      const result = await studentService.getStudentById('123');

      expect(result).toEqual(mockStudent);
      expect(mockStudentRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['class'],
      });
    });

    it('should return null if student not found', async () => {
      mockStudentRepository.findOne.mockResolvedValue(null);

      const result = await studentService.getStudentById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getStudentByCode', () => {
    it('should return a student by code', async () => {
      const mockStudent = { id: '123', studentCode: 'STU001', firstName: 'John' };
      mockStudentRepository.findOne.mockResolvedValue(mockStudent);

      const result = await studentService.getStudentByCode('STU001');

      expect(result).toEqual(mockStudent);
      expect(mockStudentRepository.findOne).toHaveBeenCalledWith({
        where: { studentCode: 'STU001' },
        relations: ['class'],
      });
    });

    it('should return null if student not found by code', async () => {
      mockStudentRepository.findOne.mockResolvedValue(null);

      const result = await studentService.getStudentByCode('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('getAllStudents', () => {
    it('should return all students without filters', async () => {
      const mockStudents = [
        { id: '1', firstName: 'John' },
        { id: '2', firstName: 'Jane' },
      ];

      const mockQueryBuilder = mockStudentRepository.createQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(mockStudents);

      const result = await studentService.getAllStudents();

      expect(result).toEqual(mockStudents);
    });

    it('should filter students by classId', async () => {
      const mockStudents = [{ id: '1', firstName: 'John', classId: 'class1' }];

      const mockQueryBuilder = mockStudentRepository.createQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(mockStudents);

      const result = await studentService.getAllStudents({ classId: 'class1' });

      expect(result).toEqual(mockStudents);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter students by gradeLevel', async () => {
      const mockStudents = [{ id: '1', firstName: 'John', gradeLevel: 5 }];

      const mockQueryBuilder = mockStudentRepository.createQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(mockStudents);

      const result = await studentService.getAllStudents({ gradeLevel: 5 });

      expect(result).toEqual(mockStudents);
    });

    it('should filter students by isActive', async () => {
      const mockStudents = [{ id: '1', firstName: 'John', isActive: true }];

      const mockQueryBuilder = mockStudentRepository.createQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(mockStudents);

      const result = await studentService.getAllStudents({ isActive: true });

      expect(result).toEqual(mockStudents);
    });

    it('should search students by name or code', async () => {
      const mockStudents = [{ id: '1', firstName: 'John' }];

      const mockQueryBuilder = mockStudentRepository.createQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(mockStudents);

      const result = await studentService.getAllStudents({ search: 'John' });

      expect(result).toEqual(mockStudents);
    });
  });

  describe('getStudentGuardians', () => {
    it('should return guardians for a student', async () => {
      const mockGuardians = [
        {
          studentId: '123',
          guardianId: 'g1',
          relationship: 'Parent',
          isPrimary: true,
          isAuthorized: true,
          guardian: { id: 'g1', firstName: 'Parent', lastName: 'One' },
        },
      ];

      mockStudentGuardianRepository.find.mockResolvedValue(mockGuardians);

      const result = await studentService.getStudentGuardians('123');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'g1',
        firstName: 'Parent',
        lastName: 'One',
        relationship: 'Parent',
        isPrimary: true,
        isAuthorized: true,
      });
    });

    it('should return empty array if no guardians found', async () => {
      mockStudentGuardianRepository.find.mockResolvedValue([]);

      const result = await studentService.getStudentGuardians('123');

      expect(result).toEqual([]);
    });
  });

  describe('canUserPickupStudent', () => {
    it('should return true if user is authorized', async () => {
      const mockRelation = {
        studentId: 's1',
        guardianId: 'g1',
        isAuthorized: true,
      };

      mockStudentGuardianRepository.findOne.mockResolvedValue(mockRelation);

      const result = await studentService.canUserPickupStudent('g1', 's1');

      expect(result).toBe(true);
    });

    it('should return false if user is not authorized', async () => {
      mockStudentGuardianRepository.findOne.mockResolvedValue(null);

      const result = await studentService.canUserPickupStudent('g1', 's1');

      expect(result).toBe(false);
    });
  });
});
