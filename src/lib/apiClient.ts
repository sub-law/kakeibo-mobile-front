"use client";

export const AUTH_REDIRECT_MESSAGE_KEY = "authRedirectMessage";
export const API_CONNECTION_ERROR_MESSAGE =
  "サーバーに接続できませんでした。通信環境を確認し、時間をおいて再度お試しください。";

const AUTH_REDIRECT_MESSAGE =
  "ログインの有効期限が切れたか、ログイン情報が無効になりました。再度ログインしてください。";

let redirectingToLogin = false;

export class ApiConnectionError extends Error {
  constructor() {
    super(API_CONNECTION_ERROR_MESSAGE);
    this.name = "ApiConnectionError";
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return error instanceof ApiConnectionError
    ? error.message
    : fallbackMessage;
}

function redirectToLogin(showMessage: boolean) {
  localStorage.removeItem("token");

  if (showMessage) {
    sessionStorage.setItem(
      AUTH_REDIRECT_MESSAGE_KEY,
      AUTH_REDIRECT_MESSAGE,
    );
  }

  if (!redirectingToLogin) {
    redirectingToLogin = true;
    window.location.replace("/login");
  }
}

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response | null> {
  const token = localStorage.getItem("token");

  if (!token) {
    redirectToLogin(false);
    return null;
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new ApiConnectionError();
  }

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiConnectionError();
  }

  if (response.status === 401) {
    redirectToLogin(true);
    return null;
  }

  return response;
}
