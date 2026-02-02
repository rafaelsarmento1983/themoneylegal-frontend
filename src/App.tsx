// App.tsx (trecho atualizado)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";

import { TenantSelectionPage } from "./pages/tenant/TenantSelectionPage";
import { NewTenantPage } from "./pages/tenant/NewTenantPage";
import { MyTenantsPage } from "./pages/tenant/MyTenantsPage";
import { BrowseTenantsPage } from "./pages/tenant/BrowseTenantsPage";

import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

import { AuthLayout } from "./components/layout/AuthLayout";
import { IntroPage } from "./pages/auth/IntroPage";
import { ChoicePage } from "./pages/auth/ChoicePage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { RecoveryPasswordPage } from "./pages/auth/RecoveryPasswordPage";
import { OtpPage } from "./pages/auth/OtpPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Navigate to="/auth/intro" replace />} />
          <Route element={<AuthLayout />}>
            <Route path="/auth/intro" element={<IntroPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />

          {/* ✅ Auth flow por rotas */}
          <Route element={<AuthLayout />}>
            {/*<Route path="/auth" element={<Navigate to="/auth/intro" replace />} />*/}
            <Route path="/auth/intro" element={<IntroPage />} />
            <Route path="/auth" element={<ChoicePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<RecoveryPasswordPage />} />
            <Route path="/otp" element={<OtpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Próximas (vamos criar depois):
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/otp" element={<OtpPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            */}
          </Route>

          {/* Rotas Protegidas + Layout */}
<Route
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
>
  <Route path="/tenant/select" element={<TenantSelectionPage />} />
  <Route path="/tenant/new" element={<NewTenantPage />} />
  <Route path="/tenant/my-workspaces" element={<MyTenantsPage />} />
  <Route path="/tenant/browse" element={<BrowseTenantsPage />} />

  <Route path="/dashboard" element={<DashboardPage />} />
</Route>

{/* ✅ fallback público (fora do ProtectedRoute) */}
<Route path="*" element={<Navigate to="/auth/intro" replace />} />

        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" closeButton expand visibleToasts={3} />
    </QueryClientProvider>
  );
}

export default App;
