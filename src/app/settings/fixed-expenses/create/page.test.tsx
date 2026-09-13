import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FixedExpenseCreatePage from "@/app/settings/fixed-expenses/create/page";
import { authenticatedFetch } from "@/lib/apiClient";

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

describe("FixedExpenseCreatePage", () => {
  afterEach(() => {
    vi.mocked(authenticatedFetch).mockReset();
    routerPush.mockReset();
  });

  it("送信中の重複登録を防ぐ", () => {
    vi.mocked(authenticatedFetch).mockImplementation(
      () => new Promise<Response | null>(() => undefined),
    );

    render(<FixedExpenseCreatePage />);
    const submitButton = screen.getByRole("button", { name: "登録する" });
    const form = submitButton.closest("form");

    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    fireEvent.submit(form!);

    const submissionCalls = vi
      .mocked(authenticatedFetch)
      .mock.calls.filter(([path]) => path === "/fixed-expenses");

    expect(submissionCalls).toHaveLength(1);
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("登録中...");
  });
});
