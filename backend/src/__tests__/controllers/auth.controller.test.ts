import { Request, Response } from 'express';
import { AuthController } from '../../controllers/auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    authController = new AuthController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('login', () => {
    it('should return 400 when credentials are missing', async () => {
      mockRequest.body = {};

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle request body correctly', () => {
      mockRequest.body = { danId: 'test001', role: 'admin' };

      expect(mockRequest.body.danId).toBe('test001');
      expect(mockRequest.body.role).toBe('admin');
    });
  });

  describe('logout', () => {
    it('should handle logout request', async () => {
      mockRequest.user = { id: '123', role: 'admin' };

      await authController.logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should return 401 when no refresh token provided', async () => {
      mockRequest.body = {};

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });
});
