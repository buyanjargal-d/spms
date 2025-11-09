import { ENV } from '../config/env';

/**
 * DAN Authentication Response
 */
export interface DanAuthResponse {
  success: boolean;
  danId: string;
  fullName: string;
  phone?: string;
  email?: string;
  errorMessage?: string;
}

/**
 * DAN Service
 *
 * Handles authentication with Mongolia's Digital Authentication Network (DAN)
 *
 * CURRENT MODE: Mock (auto-approve all requests)
 * As per requirement #10: "create service and but now it will send yes to all request"
 *
 * FUTURE: Will integrate with real DAN API when credentials are available
 */
export class DanService {
  private useMock: boolean;

  constructor() {
    this.useMock = ENV.DAN.USE_MOCK;
  }

  /**
   * Verify DAN ID with DAN system
   *
   * MOCK MODE: Always returns success with generated user data
   * REAL MODE: Calls DAN API (to be implemented later)
   *
   * @param danId - Digital Authentication Number ID
   * @returns DAN authentication response
   */
  async verifyDanId(danId: string): Promise<DanAuthResponse> {
    if (this.useMock) {
      // MOCK: Auto-approve all requests
      return {
        success: true,
        danId: danId,
        fullName: this.getMockName(danId),
        phone: this.getMockPhone(danId),
        email: this.getMockEmail(danId),
      };
    }

    // REAL DAN API (to be implemented when DAN credentials available)
    return await this.callDanApi(danId);
  }

  /**
   * Generate mock name based on DAN ID
   * For testing purposes only
   */
  private getMockName(danId: string): string {
    const names: Record<string, string> = {
      'admin001': 'Админ Админов',
      'teacher001': 'Багш Багшийн',
      'teacher002': 'Багш Хоёрдугаар',
      'parent001': 'Эцэг Эхийн',
      'parent002': 'Эцэг Хоёрдугаар',
      'guard001': 'Хамгаалагч Харуул',
    };
    return names[danId] || `Хэрэглэгч ${danId}`;
  }

  /**
   * Generate mock phone number based on DAN ID
   * For testing purposes only
   */
  private getMockPhone(danId: string): string {
    // Extract digits from danId and pad to create a phone number
    const digits = danId.replace(/\D/g, '');
    return `99${digits.padStart(6, '0')}`;
  }

  /**
   * Generate mock email based on DAN ID
   * For testing purposes only
   */
  private getMockEmail(danId: string): string {
    return `${danId}@dan.gov.mn`;
  }

  /**
   * Real DAN API call (placeholder for future implementation)
   *
   * When DAN credentials are available:
   * 1. Set USE_MOCK_DAN=false in .env
   * 2. Add real DAN_CLIENT_ID and DAN_CLIENT_SECRET
   * 3. Implement this method with actual DAN API calls
   *
   * @param danId - Digital Authentication Number ID
   * @returns DAN authentication response
   */
  private async callDanApi(_danId: string): Promise<DanAuthResponse> {
    // TODO: Implement when DAN API credentials are available
    //
    // Example implementation:
    // const response = await axios.post(`${ENV.DAN.API_URL}/verify`, {
    //   client_id: ENV.DAN.CLIENT_ID,
    //   client_secret: ENV.DAN.CLIENT_SECRET,
    //   dan_id: danId
    // });
    //
    // return {
    //   success: response.data.success,
    //   danId: response.data.danId,
    //   fullName: response.data.fullName,
    //   phone: response.data.phone,
    //   email: response.data.email
    // };

    throw new Error('Real DAN API not implemented yet. Set USE_MOCK_DAN=true in .env file.');
  }

  /**
   * Initiate OAuth flow with DAN (future implementation)
   *
   * Returns authorization URL for DAN OAuth
   */
  async initiateOAuth(): Promise<string> {
    if (this.useMock) {
      return '/mock-oauth-redirect';
    }

    // Generate OAuth authorization URL
    const params = new URLSearchParams({
      client_id: ENV.DAN.CLIENT_ID || '',
      redirect_uri: ENV.DAN.REDIRECT_URI || '',
      response_type: 'code',
      scope: 'profile email phone',
    });

    return `${ENV.DAN.API_URL}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Handle OAuth callback from DAN (future implementation)
   *
   * Exchanges authorization code for user information
   *
   * @param code - Authorization code from DAN
   * @returns DAN authentication response
   */
  async handleOAuthCallback(_code: string): Promise<DanAuthResponse> {
    if (this.useMock) {
      return {
        success: true,
        danId: 'mock_oauth_user',
        fullName: 'Mock OAuth User',
        phone: '99000000',
        email: 'oauth@dan.gov.mn',
      };
    }

    // TODO: Implement OAuth token exchange
    // 1. Exchange code for access token
    // 2. Call DAN API to get user info
    // 3. Return user data

    throw new Error('OAuth callback not implemented yet');
  }

  /**
   * Validate DAN token (for future token-based auth)
   *
   * @param token - DAN access token
   * @returns Validation result
   */
  async validateToken(_token: string): Promise<boolean> {
    if (this.useMock) {
      return true; // Always valid in mock mode
    }

    // TODO: Implement token validation with DAN API
    throw new Error('Token validation not implemented yet');
  }

  /**
   * Get DAN service status
   *
   * @returns Service status information
   */
  getStatus(): { mode: string; apiUrl: string; configured: boolean } {
    return {
      mode: this.useMock ? 'MOCK' : 'PRODUCTION',
      apiUrl: ENV.DAN.API_URL,
      configured: !!(ENV.DAN.CLIENT_ID && ENV.DAN.CLIENT_SECRET),
    };
  }
}

// Export singleton instance
export const danService = new DanService();
