import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import IncomeCreatePage from "@/app/incomes/create/page";
import {
  API_CONNECTION_ERROR_MESSAGE,
  ApiConnectionError,
  authenticatedFetch,
} from "@/lib/apiClient";

const { routerPush } = vi.hoisted(() => ({
  routerPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/components/ClientLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/lib/apiClient", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/apiClient")>();

  return {
    ...original,
    authenticatedFetch: vi.fn(),
  };
});

describe("IncomeCreatePage", () => {
  afterEach(() => {
    vi.mocked(authenticatedFetch).mockReset();
    routerPush.mockReset();
  });

  it("通信に失敗した場合は安全な日本語メッセージを表示する", async () => {
    vi.mocked(authenticatedFetch).mockRejectedValue(new ApiConnectionError());

    render(<IncomeCreatePage />);
    fireEvent.click(screen.getByRole("button", { name: "登録する" }));

    expect(await screen.findByText(API_CONNECTION_ERROR_MESSAGE))
      .toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });
});
