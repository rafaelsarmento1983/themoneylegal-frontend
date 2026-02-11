import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { sessionExpiredFlag } from "@/lib/toast/toastFlags";
import axios from "axios";
import { toastSuccess } from "@/lib/toast/toast";
import { API_BASE_URL } from "@/config/api.config";

type LogoutReason = "manual" | "expired" | "unauthorized" | "forced";

function redirectToLogin() {
  if (window.location.pathname === "/login") return;
  window.history.pushState({}, "", "/login");
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function showManualLogoutToast() {
  toastSuccess({
    id: "logout-manual",
    title: "Bye, Bye! 👋",
    description: "Desconectamos sua conta! Você pode voltar, basta entrar com seu usuário!",
    duration: 10_000,
  });
}

export function forceLogout(reason: LogoutReason = "forced") {
  if (reason === "expired") {
    sessionExpiredFlag.set("Como você não estava aqui, desconectamos sua conta.");
  }

  toast.dismiss();

  useAuthStore.getState().clearAuth?.();
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  redirectToLogin();

  // ✅ toast só quando manual
  if (reason === "manual") {
    showManualLogoutToast();
  }
}

export async function logout(reason: LogoutReason = "manual") {
  try {
    const refreshToken =
      useAuthStore.getState().refreshToken || localStorage.getItem("refreshToken");

    if (refreshToken) {
      await axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken });
    }
  } catch {
    // ignora erro — ainda vamos deslogar local
  } finally {
    forceLogout(reason);
  }
}