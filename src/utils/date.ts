//src/utils/date.ts
export function toJST(date: string | Date) {
  return new Date(date).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
}
