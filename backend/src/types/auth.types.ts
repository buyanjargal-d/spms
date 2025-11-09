import { UserRole } from '../models/User';

export interface LoginRequest {
  danId: string;
  password?: string; // For testing without DAN integration
  role?: UserRole; // For DAN registration
  rememberMe?: boolean; // For extended session
}

export interface LoginResponse {
  user: {
    id: string;
    danId: string;
    fullName: string;
    role: UserRole;
    email?: string;
    phone?: string;
    profilePhotoUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  danId: string;
  role: UserRole;
  jti?: string; // JWT Token Identifier for session tracking
}
