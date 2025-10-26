import { UserRole } from '../models/User';

export interface LoginRequest {
  danId: string;
  password?: string; // For testing without DAN integration
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
}
