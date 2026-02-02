import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { LoginRequest } from '@/types/auth.types';

export const useLogin = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.defaultTenant, data.accessToken, data.refreshToken);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
    },
  });
};
