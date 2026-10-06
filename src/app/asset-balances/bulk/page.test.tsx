import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AssetBalanceBulkPage from "@/app/asset-balances/bulk/page";
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

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("AssetBalanceBulkPage", () => {
  afterEach(() => {
    vi.mocked(authenticatedFetch).mockReset();
    routerPush.mockReset();
  });

  it("小数を別の整数へ変換せず入力エラーとして表示する", async () => {
    vi.mocked(authenticatedFetch).mockImplementation((path) => {
      if (path === "/accounts") {
        return Promise.resolve(
          jsonResponse([{ id: 1, name: "普通預金", type: "bank" }]),
        );
      }

      if (path.startsWith("/asset-balances?")) {
        return Promise.resolve(jsonResponse({ data: [] }));
      }

      return Promise.resolve(null);
    });

    const { container } = render(<AssetBalanceBulkPage />);

    await screen.findByText("普通預金（bank）");

    const amountInput = container.querySelector('input[type="number"]');
    const form = amountInput?.closest("form");

    expect(amountInput).not.toBeNull();
    expect(form).not.toBeNull();

    fireEvent.change(amountInput!, { target: { value: "1234.5" } });
    fireEvent.submit(form!);

    expect(
      screen.getByText("金額は整数で入力してください。"),
    ).toBeInTheDocument();

    await waitFor(() => {
      const submissionCalls = vi
        .mocked(authenticatedFetch)
        .mock.calls.filter(([path]) => path === "/asset-balances/bulk");

      expect(submissionCalls).toHaveLength(0);
    });
  });
});
