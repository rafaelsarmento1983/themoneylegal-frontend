import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { RegisterRequest } from '@/types/auth.types';

export const useRegister = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.defaultTenant, data.accessToken, data.refreshToken);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao cadastrar';
      toast.error(message);
    },
  });
};
