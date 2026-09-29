import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ExpenseCategorySummaryPage from "@/app/expenses/category-summary/page";
import { authenticatedFetch } from "@/lib/apiClient";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigationMocks.push }),
  useSearchParams: () => navigationMocks.searchParams,
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

describe("ExpenseCategorySummaryPage", () => {
  afterEach(() => {
    navigationMocks.searchParams = new URLSearchParams();
    navigationMocks.push.mockReset();
    vi.mocked(authenticatedFetch).mockReset();
  });

  it("URLで指定された年月を初期表示する", async () => {
    navigationMocks.searchParams = new URLSearchParams({
      year: "2025",
      month: "7",
    });
    vi.mocked(authenticatedFetch).mockImplementation(() =>
      Promise.resolve(jsonResponse([])),
    );

    render(<ExpenseCategorySummaryPage />);

    expect(screen.getByText("2025年 7月")).toBeInTheDocument();
    await waitFor(() =>
      expect(authenticatedFetch).toHaveBeenCalledWith(
        "/expenses?year=2025&month=7",
      ),
    );
    expect(authenticatedFetch).toHaveBeenCalledWith("/categories");
  });
});
