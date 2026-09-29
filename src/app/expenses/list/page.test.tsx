import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ExpenseListPage from "@/app/expenses/list/page";
import { authenticatedFetch } from "@/lib/apiClient";

const navigationMocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
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

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function expense(id: number, date: string, amount: number) {
  return {
    id,
    date,
    amount,
    memo: "",
    category_id: 1,
    category: {
      id: 1,
      name: "食費",
      category_group_id: 1,
      group: {
        id: 1,
        name: "生活費",
      },
    },
  };
}

describe("ExpenseListPage", () => {
  beforeEach(() => {
    navigationMocks.searchParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.mocked(authenticatedFetch).mockReset();
  });

  it("戻るリンクに表示中の年月を引き継ぐ", () => {
    navigationMocks.searchParams = new URLSearchParams({
      year: "2025",
      month: "12",
    });
    vi.mocked(authenticatedFetch).mockImplementation(() =>
      Promise.resolve(jsonResponse([])),
    );

    render(<ExpenseListPage />);

    expect(screen.getByRole("link", { name: "戻る" })).toHaveAttribute(
      "href",
      "/expenses/category-summary?year=2025&month=12",
    );

    fireEvent.click(screen.getByRole("button", { name: "→" }));

    expect(screen.getByRole("link", { name: "戻る" })).toHaveAttribute(
      "href",
      "/expenses/category-summary?year=2026&month=1",
    );
  });

  it("新しい順を初期表示し、古い順へ切り替える", async () => {
    navigationMocks.searchParams = new URLSearchParams({
      year: "2025",
      month: "7",
    });
    vi.mocked(authenticatedFetch).mockImplementation((path) => {
      if (path === "/categories") {
        return Promise.resolve(jsonResponse([]));
      }

      if (path.startsWith("/expenses?")) {
        return Promise.resolve(
          jsonResponse([
            expense(1, "2025-07-01", 1000),
            expense(2, "2025-07-20", 2000),
            expense(3, "2025-07-20", 3000),
          ]),
        );
      }

      return Promise.resolve(null);
    });

    render(<ExpenseListPage />);

    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: "詳細" })).toHaveLength(3),
    );

    const getDetailHrefs = () =>
      screen
        .getAllByRole("link", { name: "詳細" })
        .map((link) => link.getAttribute("href"));
    const newestFirstButton = screen.getByRole("button", {
      name: "新しい順（降順）",
    });
    const oldestFirstButton = screen.getByRole("button", {
      name: "古い順（昇順）",
    });

    expect(getDetailHrefs()).toEqual([
      "/expenses/3",
      "/expenses/2",
      "/expenses/1",
    ]);
    expect(newestFirstButton).toHaveAttribute("aria-pressed", "true");
    expect(oldestFirstButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(oldestFirstButton);

    expect(getDetailHrefs()).toEqual([
      "/expenses/1",
      "/expenses/2",
      "/expenses/3",
    ]);
    expect(newestFirstButton).toHaveAttribute("aria-pressed", "false");
    expect(oldestFirstButton).toHaveAttribute("aria-pressed", "true");
  });

  it("年月切替前の遅いレスポンスで現在の一覧を上書きしない", async () => {
    const requests: ReturnType<typeof createDeferred<Response | null>>[] = [];

    vi.mocked(authenticatedFetch).mockImplementation((path) => {
      if (path === "/categories") {
        return Promise.resolve(jsonResponse([]));
      }

      if (!path.startsWith("/expenses?")) {
        return Promise.resolve(null);
      }

      const request = createDeferred<Response | null>();
      requests.push(request);

      return request.promise;
    });

    render(<ExpenseListPage />);

    await waitFor(() => expect(requests).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", { name: "→" }));
    await waitFor(() => expect(requests).toHaveLength(2));

    await act(async () => {
      requests[1].resolve(
        jsonResponse([expense(2, "2099-02-02", 2000)]),
      );
    });

    expect(await screen.findByText("2099-02-02")).toBeInTheDocument();

    await act(async () => {
      requests[0].resolve(
        jsonResponse([expense(1, "2099-01-01", 1000)]),
      );
    });

    expect(screen.queryByText("2099-01-01")).not.toBeInTheDocument();
    expect(screen.getByText("2099-02-02")).toBeInTheDocument();
  });
});
