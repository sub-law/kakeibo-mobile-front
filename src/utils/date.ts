//src/utils/date.ts
const YEAR_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function toJST(date: string | Date): string {
  return new Date(date).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
}

export function formatJstYearMonth(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  if (!year || !month) {
    throw new Error("年月を取得できませんでした。");
  }

  return `${year}-${month}`;
}

export function resolveYearMonth(
  requestedMonth: string | null,
  currentDate: Date = new Date(),
): string {
  const match = requestedMonth?.match(YEAR_MONTH_PATTERN);
  const year = Number(match?.[1]);

  if (match && year >= 1900 && year <= 2100) {
    return requestedMonth as string;
  }

  return formatJstYearMonth(currentDate);
}
