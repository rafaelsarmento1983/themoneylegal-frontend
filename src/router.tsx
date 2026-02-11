import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

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

import ChooseTypePage from "./pages/profile/ChooseTypePage";
import PessoaFisicaFormPage from "./pages/profile/PessoaFisicaFormPage";
import PessoaJuridicaFormPage from "./pages/profile/PessoaJuridicaFormPage";
import AddressFormPage from "./pages/profile/AddressFormPage";

export const router = createBrowserRouter(
  [
    { path: "/", element: <Navigate to="/auth/intro" replace /> },

    {
      element: <AuthLayout />,
      children: [
        { path: "/auth/intro", element: <IntroPage /> },
        { path: "/auth", element: <ChoicePage /> },
        { path: "/register", element: <RegisterPage /> },
        { path: "/forgot-password", element: <RecoveryPasswordPage /> },
        { path: "/otp", element: <OtpPage /> },
        { path: "/reset-password", element: <ResetPasswordPage /> },
      ],
    },

    { path: "/login", element: <LoginPage /> },

    { path: "/complete-profile/choose-type", element: <ChooseTypePage /> },
    { path: "/complete-profile/pessoa-fisica", element: <PessoaFisicaFormPage /> },
    { path: "/complete-profile/pessoa-juridica", element: <PessoaJuridicaFormPage /> },
    { path: "/complete-profile/address", element: <AddressFormPage /> },

    {
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/tenant/select", element: <TenantSelectionPage /> },
        { path: "/tenant/new", element: <NewTenantPage /> },
        { path: "/tenant/my-workspaces", element: <MyTenantsPage /> },
        { path: "/tenant/browse", element: <BrowseTenantsPage /> },
        { path: "/dashboard", element: <DashboardPage /> },
      ],
    },

    { path: "*", element: <Navigate to="/auth/intro" replace /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);
