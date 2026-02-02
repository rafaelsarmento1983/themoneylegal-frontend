// src/components/layout/AuthLayout.tsx
import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const AuthLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Se já estiver logado, manda pro dashboard
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      {/* Background base para todas as telas de auth */}
      <div className="min-h-screen w-full flex items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />
        <div className="relative z-10 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
