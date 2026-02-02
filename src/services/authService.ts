import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';

/**
 * ⭐ Interface para resposta da verificação de email
 */
interface EmailCheckResponse {
  exists: boolean;
  message: string;
}

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async resendVerification(email: string): Promise<void> {
    await api.post('/auth/resend-verification', null, { params: { email } });
  },

  // Solicita envio do código OTP para reset de senha
  async requestPasswordReset(data: { email: string }) {
    return api.post("/auth/forgot-password", {
      email: data.email
    });
  },

  // Valida o código OTP
  async validatePasswordResetOtp(data: {
    email: string;
    otp: string;
  }) {
    return api.post("/auth/verify-reset-code", {
      email: data.email,
      code: data.otp, // <-- mapeia otp -> code
    });
  },

  async preRegister(data: { name: string; email: string }) {
    return api.post("/auth/pre-register", {
      name: data.name,
      email: data.email,
    });
  },

  // Define nova senha
  async confirmPasswordReset(data: {
    email: string;
    otp: string;
    password: string;
  }) {
    return api.post("/auth/reset-password", {
      email: data.email,
      code: data.otp,        // <-- mapeia otp -> code
      newPassword: data.password, // <-- mapeia password -> newPassword
    });
  },

  /**
   * ⭐ NOVO: Verifica se email já está cadastrado
   * 
   * Endpoint: GET /api/v1/auth/check-email
   * 
   * @param email Email a ser verificado
   * @returns { exists: boolean, message: string }
   */
  async checkEmailAvailability(email: string): Promise<EmailCheckResponse> {
    try {
      const response = await api.get('/auth/check-email', {
        params: { email }
      });
      return response.data;
    } catch (error: any) {
      // Se der erro na API, assumir que não existe (para não bloquear cadastro)
      console.error('Erro ao verificar email:', error);
      return {
        exists: false,
        message: 'Não foi possível verificar o email'
      };
    }
  },
};
