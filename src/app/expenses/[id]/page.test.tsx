import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ExpenseDetailPage from "@/app/expenses/[id]/page";
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

vi.mock("@/components/ModalConfirmDelete", () => ({
  default: () => null,
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

describe("ExpenseDetailPage", () => {
  afterEach(() => {
    navigationMocks.push.mockReset();
    vi.mocked(authenticatedFetch).mockReset();
  });

  it("出金日の年月に対応する一覧へ戻る", async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue(
      jsonResponse({
        id: 1,
        date: "2025-07-15",
        amount: 1200,
        memo: "昼食",
        category: {
          name: "外食",
          group: { name: "食費" },
        },
      }),
    );

    render(<ExpenseDetailPage />);

    expect(await screen.findByRole("link", { name: "戻る" })).toHaveAttribute(
      "href",
      "/expenses/list?year=2025&month=7",
    );
    expect(authenticatedFetch).toHaveBeenCalledWith("/expenses/1");
  });
});
