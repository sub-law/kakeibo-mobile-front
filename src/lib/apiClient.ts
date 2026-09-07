"use client";

export const AUTH_REDIRECT_MESSAGE_KEY = "authRedirectMessage";

const AUTH_REDIRECT_MESSAGE =
  "ログインの有効期限が切れたか、ログイン情報が無効になりました。再度ログインしてください。";

let redirectingToLogin = false;

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

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`,
    {
      ...init,
      headers,
    },
  );

  if (response.status === 401) {
    redirectToLogin(true);
    return null;
  }

  return response;
}
