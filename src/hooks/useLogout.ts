import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const useLogout = () => {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();
  const refreshToken = useAuthStore((state) => state.refreshToken);

  return useMutation({
    mutationFn: () => authService.logout(refreshToken || ''),
    onSettled: () => {
      clearAuth();
      navigate('/login');
    },
  });
};
