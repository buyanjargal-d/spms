import { StudentService } from '../../services/student.service';

// Mock TypeORM
jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('StudentService', () => {
  let studentService: StudentService;

  beforeEach(() => {
    studentService = new StudentService();
  });

  it('should be defined', () => {
    expect(studentService).toBeDefined();
  });

  it('should have getAllStudents method', () => {
    expect(studentService.getAllStudents).toBeDefined();
    expect(typeof studentService.getAllStudents).toBe('function');
  });

  it('should have getStudentById method', () => {
    expect(studentService.getStudentById).toBeDefined();
    expect(typeof studentService.getStudentById).toBe('function');
  });

  it('should have getStudentByCode method', () => {
    expect(studentService.getStudentByCode).toBeDefined();
    expect(typeof studentService.getStudentByCode).toBe('function');
  });

  it('should have getStudentGuardians method', () => {
    expect(studentService.getStudentGuardians).toBeDefined();
    expect(typeof studentService.getStudentGuardians).toBe('function');
  });

  it('should have canUserPickupStudent method', () => {
    expect(studentService.canUserPickupStudent).toBeDefined();
    expect(typeof studentService.canUserPickupStudent).toBe('function');
  });
});
