import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  API_CONNECTION_ERROR_MESSAGE,
  ApiConnectionError,
  authenticatedFetch,
} from "@/lib/apiClient";

describe("authenticatedFetch", () => {
  beforeEach(() => {
    localStorage.setItem("token", "dummy-token");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000/api");
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("API URLと認証ヘッダーを設定してレスポンスを返す", async () => {
    const response = new Response(null, { status: 200 });
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(authenticatedFetch("/accounts")).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8000/api/accounts");
    expect(new Headers(init?.headers).get("Authorization"))
      .toBe("Bearer dummy-token");
  });

  it("ネットワーク例外を安全な接続エラーへ変換する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(authenticatedFetch("/accounts")).rejects.toMatchObject({
      name: "ApiConnectionError",
      message: API_CONNECTION_ERROR_MESSAGE,
    });
  });

  it("API URLが未設定の場合は通信を行わず接続エラーにする", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    await expect(authenticatedFetch("/accounts"))
      .rejects.toBeInstanceOf(ApiConnectionError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
