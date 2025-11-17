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

  it('should have createStudent method', () => {
    expect(studentService.createStudent).toBeDefined();
    expect(typeof studentService.createStudent).toBe('function');
  });

  it('should have updateStudent method', () => {
    expect(studentService.updateStudent).toBeDefined();
    expect(typeof studentService.updateStudent).toBe('function');
  });

  it('should have deleteStudent method', () => {
    expect(studentService.deleteStudent).toBeDefined();
    expect(typeof studentService.deleteStudent).toBe('function');
  });
});
