import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ExpenseCreatePage from "@/app/expenses/create/page";
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

describe("ExpenseCreatePage", () => {
  afterEach(() => {
    vi.mocked(authenticatedFetch).mockReset();
    routerPush.mockReset();
    sessionStorage.clear();
  });

  it("送信中の重複登録を防ぐ", () => {
    vi.mocked(authenticatedFetch).mockImplementation(
      () => new Promise<Response | null>(() => undefined),
    );

    render(<ExpenseCreatePage />);
    const submitButton = screen.getByRole("button", { name: "登録する" });
    const form = submitButton.closest("form");

    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    fireEvent.submit(form!);

    const submissionCalls = vi
      .mocked(authenticatedFetch)
      .mock.calls.filter(([path]) => path === "/expenses");

    expect(submissionCalls).toHaveLength(1);
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("登録中...");
  });

  it("登録成功後に出金一覧へ遷移する", async () => {
    vi.mocked(authenticatedFetch).mockImplementation(() =>
      Promise.resolve(new Response(null, { status: 201 })),
    );

    render(<ExpenseCreatePage />);
    fireEvent.submit(screen.getByRole("button", { name: "登録する" }));

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith("/expenses/list");
    });
    expect(sessionStorage.getItem("expenseSuccessMessage")).toBe(
      "登録しました",
    );
  });
});
