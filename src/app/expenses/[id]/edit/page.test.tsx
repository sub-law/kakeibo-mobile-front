import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ExpenseEditPage from "@/app/expenses/[id]/edit/page";
import { authenticatedFetch } from "@/lib/apiClient";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
  useRouter: () => ({ push: navigationMocks.push }),
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

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ExpenseEditPage", () => {
  afterEach(() => {
    navigationMocks.push.mockReset();
    vi.mocked(authenticatedFetch).mockReset();
  });

  it("更新後の出金日の年月に対応する一覧へ遷移する", async () => {
    vi.mocked(authenticatedFetch).mockImplementation((path, options) => {
      if (path === "/expenses/1" && options?.method === "PUT") {
        return Promise.resolve(new Response(null, { status: 200 }));
      }

      if (path === "/expenses/1") {
        return Promise.resolve(
          jsonResponse({
            date: "2025-07-15",
            amount: 1200,
            memo: "昼食",
            category_id: 1,
          }),
        );
      }

      if (path === "/categories") {
        return Promise.resolve(
          jsonResponse([
            {
              id: 1,
              name: "食費",
              categories: [{ id: 1, name: "外食" }],
            },
          ]),
        );
      }

      return Promise.resolve(null);
    });

    render(<ExpenseEditPage />);

    const dateInput = await screen.findByDisplayValue("2025-07-15");
    fireEvent.change(dateInput, { target: { value: "2025-08-20" } });
    fireEvent.click(screen.getByRole("button", { name: "修正する" }));

    await waitFor(
      () =>
        expect(navigationMocks.push).toHaveBeenCalledWith(
          "/expenses/list?year=2025&month=8",
        ),
      { timeout: 2000 },
    );
  });
});
