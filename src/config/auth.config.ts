function safeTrim(v?: string) {
  const s = v?.trim();
  return s ? s : undefined;
}

/**
 * Mensagens amigáveis baseadas no "code" do backend
 * (mantém fallback do backend caso venha preenchido)
 */
export function messageByCode(code?: string, fallback?: string) {
  const fromBackend = safeTrim(fallback);
  if (fromBackend) return fromBackend;

  switch (code) {
    case "AUTH_TOKEN_EXPIRED":
      return "Sua sessão expirou. Faça login novamente.";
    case "AUTH_TOKEN_INVALID_SIGNATURE":
      return "Token inválido (assinatura). Faça login novamente.";
    case "AUTH_TOKEN_MALFORMED":
      return "Token malformado. Faça login novamente.";
    case "AUTH_TOKEN_UNSUPPORTED":
      return "Token não suportado. Faça login novamente.";
    case "AUTH_TOKEN_MISSING":
      return "Sessão inválida. Faça login novamente.";
    case "AUTH_TOKEN_INVALID":
    case "AUTH_UNAUTHORIZED":
    default:
      return "Falha de autenticação. Faça login novamente.";
  }
}