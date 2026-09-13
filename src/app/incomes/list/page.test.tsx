import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import IncomeListPage from "@/app/incomes/list/page";
import { authenticatedFetch } from "@/lib/apiClient";

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

describe("IncomeListPage", () => {
  afterEach(() => {
    vi.mocked(authenticatedFetch).mockReset();
  });

  it("年月切替前の遅いレスポンスで現在の一覧を上書きしない", async () => {
    const requests: ReturnType<typeof createDeferred<Response | null>>[] = [];

    vi.mocked(authenticatedFetch).mockImplementation((path) => {
      if (!path.startsWith("/incomes?")) {
        return Promise.resolve(null);
      }

      const request = createDeferred<Response | null>();
      requests.push(request);

      return request.promise;
    });

    render(<IncomeListPage />);

    await waitFor(() => expect(requests).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", { name: "次の月 →" }));
    await waitFor(() => expect(requests).toHaveLength(2));

    await act(async () => {
      requests[1].resolve(
        jsonResponse([{ id: 2, date: "2099-02-02", amount: 2000 }]),
      );
    });

    expect(await screen.findByText("2099-02-02")).toBeInTheDocument();

    await act(async () => {
      requests[0].resolve(
        jsonResponse([{ id: 1, date: "2099-01-01", amount: 1000 }]),
      );
    });

    expect(screen.queryByText("2099-01-01")).not.toBeInTheDocument();
    expect(screen.getByText("2099-02-02")).toBeInTheDocument();
  });
});
