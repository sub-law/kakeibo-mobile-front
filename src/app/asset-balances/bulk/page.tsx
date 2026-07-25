//src/app/asset-balances/bulk/page.tsx
"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";

interface Account {
  id: number;
  name: string;
  type: string;
}
interface Balance {
  user_id?: number;
  account_id: number;
  amount: number;
}

export default function AssetBalanceBulkPage() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [amounts, setAmounts] = useState<{ [key: number]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [accountError, setAccountError] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const fixedDate = `${selectedMonth}-01`;

  const moveMonth = (diff: number) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const newYear =
      month + diff < 1 ? year - 1 : month + diff > 12 ? year + 1 : year;
    const newMonth = ((month - 1 + diff + 12) % 12) + 1;
    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, "0")}`;
    setSelectedMonth(newMonthStr);
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        setAccountError("");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("口座一覧の取得に失敗しました。");
        }

        const data: unknown = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("口座一覧の形式が正しくありません。");
        }

        setAccounts(data as Account[]);
      } catch {
        setAccounts([]);
        setAccountError(
          "口座一覧の取得に失敗しました。時間をおいて再度お試しください。",
        );
      }
    };

    fetchAccounts();
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const fetchExistingBalances = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setBalanceLoading(true);
      setBalanceError("");

      const [year, month] = selectedMonth.split("-");
      const monthNumber = Number(month);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/asset-balances?year=${year}&month=${monthNumber}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("月次残高の取得に失敗しました。");
        }

        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];

        const newAmounts: { [key: number]: string } = {};
        list.forEach((bal: Balance) => {
          newAmounts[bal.account_id] = String(Math.round(bal.amount));
        });

        if (!cancelled) {
          setAmounts(newAmounts);
        }
      } catch {
        if (!cancelled) {
          setBalanceError(
            "月次残高の取得に失敗しました。時間をおいて再度お試しください。",
          );
        }
      } finally {
        if (!cancelled) {
          setBalanceLoading(false);
        }
      }
    };

    void fetchExistingBalances();

    return () => {
      cancelled = true;
    };
  }, [selectedMonth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const payload = {
      date: fixedDate,
      balances: accounts.map((acc) => ({
        account_id: acc.id,
        amount: Math.round(Number(amounts[acc.id] || 0)), // ★ 誤差対策
      })),
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/asset-balances/bulk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (res.ok) {
      setSuccessMessage("月次残高を登録しました（上書き含む）");

      setTimeout(() => {
        setSuccessMessage("");
        router.push("/asset-balances/list");
      }, 1000);
    } else {
      alert("登録に失敗しました");
    }
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">月次残高登録・一覧</h1>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">対象月</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex justify-between mb-4">
            <Button
              variant="navigation"
              size="compact"
              full={false}
              onClick={() => moveMonth(-1)}
            >
              ◀ 前の月
            </Button>
            <Button
              variant="navigation"
              size="compact"
              full={false}
              onClick={() => moveMonth(1)}
            >
              次の月 ▶
            </Button>
          </div>

          <p className="mb-4 text-sm text-gray-600">
            登録日：{fixedDate}（月初固定）
          </p>

          {successMessage && (
            <p className="mb-4 p-2 text-green-700 bg-green-100 border border-green-300 rounded text-center">
              {successMessage}
            </p>
          )}

          {accountError && (
            <p className="mb-4 p-2 text-red-700 bg-red-100 border border-red-300 rounded text-center">
              {accountError}
            </p>
          )}

          {balanceError ? (
            <p className="mb-4 p-2 text-red-700 bg-red-100 border border-red-300 rounded text-center">
              {balanceError}
            </p>
          ) : balanceLoading ? (
            <p>読み込み中...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {accounts.map((acc) => (
                <div key={acc.id}>
                  <label className="block mb-1 font-semibold">
                    {acc.name}（{acc.type}）
                  </label>
                  <input
                    type="number"
                    value={amounts[acc.id] || ""}
                    onChange={(e) =>
                      setAmounts({
                        ...amounts,
                        [acc.id]: e.target.value.replace(/\D/g, ""), // ★ 数字以外排除
                      })
                    }
                    className="no-number-spinner w-full border p-2 rounded"
                    placeholder="例: 150,000"
                  />
                </div>
              ))}

              <Button type="submit" variant="success">
                一括登録する
              </Button>
            </form>
          )}

          <ButtonLink href="/asset-balances" variant="secondary" className="mt-6">
            戻る
          </ButtonLink>
        </div>
      </div>
    </ClientLayout>
  );
}
