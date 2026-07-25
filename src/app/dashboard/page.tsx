"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ClientLayout from "@/components/ClientLayout";
import ButtonLink from "@/components/ui/ButtonLink";

type TabKey = "cashflow" | "assets";

interface MonthlySummary {
  month: number;
  income: number;
  expense: number;
  assets: number;
  assets_by_account: Record<string, number>;
}

interface StatsResponse {
  year: number;
  accounts: Array<{
    id: number;
    name: string;
    type: string;
  }>;
  monthly: MonthlySummary[];
  totals: {
    income: number;
    expense: number;
    balance: number;
    latest_assets: number;
    asset_change: number;
  };
}

const tabs: Array<{
  key: TabKey;
  label: string;
}> = [
  { key: "cashflow", label: "出金・入金" },
  { key: "assets", label: "総資産" },
];

const formatCurrency = (amount: number) =>
  `${Math.round(amount).toLocaleString()} 円`;

const formatCompactCurrency = (amount: number) =>
  new Intl.NumberFormat("ja-JP", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);

const assetColors = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#4b5563",
  "#ea580c",
];

export default function DashboardPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState<TabKey>("cashflow");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const yearOptions = useMemo(
    () => Array.from({ length: 11 }, (_, index) => currentYear - index),
    [currentYear],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      setFetchError("");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/stats/${year}/monthly-summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("年次集計の取得に失敗しました。");
        }

        const data: StatsResponse = await response.json();

        if (!cancelled) {
          setStats(data);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
          setFetchError(
            "年次集計の取得に失敗しました。時間をおいて再度お試しください。",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchStats();

    return () => {
      cancelled = true;
    };
  }, [router, year]);

  const activeTabLabel =
    tabs.find((tab) => tab.key === activeTab)?.label ?? tabs[0].label;
  const assetChartData = stats
    ? stats.monthly.map((item) => ({
        ...item,
        ...Object.fromEntries(
          stats.accounts.map((account) => [
            `account_${account.id}`,
            item.assets_by_account[String(account.id)] ?? 0,
          ]),
        ),
      }))
    : [];

  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 px-4 py-5 sm:p-6">
        <div className="mx-auto max-w-lg rounded-lg bg-white p-4 shadow sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">年間レポート</p>
              <h1 className="text-2xl font-bold text-gray-900">管理画面</h1>
            </div>

            <label className="text-sm font-semibold text-gray-700">
              対象年
              <select
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="mt-1 block rounded border border-gray-300 bg-white px-3 py-2 text-base"
              >
                {yearOptions.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}年
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            className="mb-5 grid grid-cols-2 rounded-lg bg-gray-100 p-1"
            role="tablist"
            aria-label="集計種別"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-md px-2 py-2 text-sm font-bold transition ${
                    isActive
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {fetchError ? (
            <p className="rounded border border-red-300 bg-red-100 p-3 text-center text-red-700">
              {fetchError}
            </p>
          ) : loading ? (
            <p className="py-16 text-center text-gray-600">読み込み中...</p>
          ) : stats ? (
            <>
              <section className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                {activeTab === "assets" ? (
                  <>
                    <p className="text-sm text-gray-600">最新の総資産</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totals.latest_assets)}
                    </p>
                    <p
                      className={`mt-2 text-sm font-semibold ${
                        stats.totals.asset_change >= 0
                          ? "text-blue-700"
                          : "text-red-700"
                      }`}
                    >
                      年内増減：{formatCurrency(stats.totals.asset_change)}
                    </p>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">年間出金</p>
                      <p className="mt-1 font-bold text-red-700">
                        {formatCurrency(stats.totals.expense)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">年間入金</p>
                      <p className="mt-1 font-bold text-green-700">
                        {formatCurrency(stats.totals.income)}
                      </p>
                    </div>
                    <div className="col-span-2 border-t border-gray-200 pt-3">
                      <p className="text-sm text-gray-600">年間収支</p>
                      <p
                        className={`mt-1 text-xl font-bold ${
                          stats.totals.balance >= 0
                            ? "text-blue-700"
                            : "text-red-700"
                        }`}
                      >
                        {formatCurrency(stats.totals.balance)}
                      </p>
                    </div>
                  </div>
                )}
              </section>

              <section aria-label={`${activeTabLabel}の月次グラフ`}>
                <h2 className="mb-3 font-bold text-gray-800">月次グラフ</h2>
                <div className="h-64 w-full" role="img">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === "assets" ? (
                      <BarChart
                        data={assetChartData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickFormatter={(month) => `${month}月`}
                          interval={0}
                          minTickGap={0}
                          fontSize={12}
                        />
                        <YAxis
                          width={54}
                          tickFormatter={formatCompactCurrency}
                          fontSize={11}
                        />
                        <Tooltip
                          labelFormatter={(month) => `${month}月`}
                          formatter={(value, name) => [
                            formatCurrency(Number(value)),
                            name,
                          ]}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        {stats.accounts.map((account, index) => (
                          <Bar
                            key={account.id}
                            dataKey={`account_${account.id}`}
                            name={account.name}
                            stackId="assets"
                            fill={assetColors[index % assetColors.length]}
                          />
                        ))}
                      </BarChart>
                    ) : (
                      <BarChart
                        data={stats.monthly}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickFormatter={(month) => `${month}月`}
                          interval={0}
                          minTickGap={0}
                          fontSize={12}
                        />
                        <YAxis
                          width={54}
                          tickFormatter={formatCompactCurrency}
                          fontSize={11}
                        />
                        <Tooltip
                          labelFormatter={(month) => `${month}月`}
                          formatter={(value, name) => [
                            formatCurrency(Number(value)),
                            name,
                          ]}
                        />
                        <Bar
                          dataKey="expense"
                          name="出金"
                          fill="#dc2626"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="income"
                          name="入金"
                          fill="#16a34a"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="mt-6">
                <h2 className="mb-3 font-bold text-gray-800">月別金額</h2>
                <div className="divide-y rounded-lg border border-gray-200">
                  {stats.monthly.map((item) => (
                    <div
                      key={item.month}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <span className="font-semibold text-gray-700">
                        {item.month}月
                      </span>
                      {activeTab === "assets" ? (
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">
                            {formatCurrency(item.assets)}
                          </span>
                          <ButtonLink
                            href={`/asset-balances/list?month=${year}-${String(
                              item.month,
                            ).padStart(2, "0")}`}
                            size="compact"
                            full={false}
                            className="text-sm"
                          >
                            詳細
                          </ButtonLink>
                        </div>
                      ) : (
                        <div className="text-right text-sm">
                          <p className="font-semibold text-red-700">
                            出金：{formatCurrency(item.expense)}
                          </p>
                          <p className="mt-1 font-semibold text-green-700">
                            入金：{formatCurrency(item.income)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : null}

          <ButtonLink href="/" variant="secondary" className="mt-6">
            トップへ戻る
          </ButtonLink>
        </div>
      </main>
    </ClientLayout>
  );
}
