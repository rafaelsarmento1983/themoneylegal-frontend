import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';

/**
 * ⭐ Interface para resposta da verificação de email
 */
interface EmailCheckResponse {
  exists: boolean;
  message: string;
}

/**
 * Helper: loga erro somente quando fizer sentido
 */
const logIfNotStatus = (error: any, ignoreStatuses: number[], context: string) => {
  const status = error?.response?.status;
  if (!ignoreStatuses.includes(status)) {
    console.error(context, error);
  }
};

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao registrar (/auth/register):');
      throw error;
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      // 401 é esperado quando credencial inválida
      logIfNotStatus(error, [401], 'Erro ao logar (/auth/login):');
      throw error;
    }
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error: any) {
      // logout falhar não deve “quebrar” UX; mas vamos manter throw (pra não mudar comportamento)
      logIfNotStatus(error, [], 'Erro no logout (/auth/logout):');
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error: any) {
      // 401/403 pode ser refresh expirado/inválido
      logIfNotStatus(error, [401, 403], 'Erro ao refresh token (/auth/refresh):');
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao solicitar forgot-password (/auth/forgot-password):');
      throw error;
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao resetar senha (/auth/reset-password):');
      throw error;
    }
  },

  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post('/auth/verify-email', { token });
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao verificar email (/auth/verify-email):');
      throw error;
    }
  },

  async resendVerification(email: string): Promise<void> {
    try {
      await api.post('/auth/resend-verification', null, { params: { email } });
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao reenviar verificação (/auth/resend-verification):');
      throw error;
    }
  },

  // Solicita envio do código OTP para reset de senha
  async requestPasswordReset(data: { email: string }) {
    try {
      return await api.post('/auth/forgot-password', { email: data.email });
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao solicitar OTP (/auth/forgot-password):');
      throw error;
    }
  },

  // Valida o código OTP
  async validatePasswordResetOtp(data: { email: string; otp: string }) {
    try {
      return await api.post('/auth/verify-reset-code', {
        email: data.email,
        code: data.otp,
      });
    } catch (error: any) {
      // 400 costuma ser OTP inválido
      logIfNotStatus(error, [400], 'Erro ao validar OTP (/auth/verify-reset-code):');
      throw error;
    }
  },

  async preRegister(data: { name: string; email: string }) {
    try {
      return await api.post('/auth/pre-register', {
        name: data.name,
        email: data.email,
      });
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro no pré-registro (/auth/pre-register):');
      throw error;
    }
  },

  // Define nova senha
  async confirmPasswordReset(data: { email: string; otp: string; password: string }) {
    try {
      return await api.post('/auth/reset-password', {
        email: data.email,
        code: data.otp,
        newPassword: data.password,
      });
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao confirmar reset de senha (/auth/reset-password):');
      throw error;
    }
  },

  /**
   * ⭐ Verifica se email já está cadastrado
   * Endpoint: GET /api/v1/auth/check-email
   *
   * Mantém a lógica original: se der erro na API, não bloqueia cadastro.
   */
  async checkEmailAvailability(email: string): Promise<EmailCheckResponse> {
    try {
      const response = await api.get('/auth/check-email', { params: { email } });
      return response.data;
    } catch (error: any) {
      // 400 pode ser email inválido; não precisa poluir console no UX
      logIfNotStatus(error, [400], 'Erro ao verificar email (/auth/check-email):');

      return {
        exists: false,
        message: 'Não foi possível verificar o email',
      };
    }
  },
};
