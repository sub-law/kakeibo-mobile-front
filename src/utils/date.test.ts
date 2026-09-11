import { describe, expect, it } from "vitest";

import { formatJstYearMonth, resolveYearMonth } from "@/utils/date";

describe("年月処理", () => {
  const jstMonthStart = new Date("2026-08-31T15:30:00.000Z");

  it("UTCでは前月でもJSTの年月を返す", () => {
    expect(formatJstYearMonth(jstMonthStart)).toBe("2026-09");
  });

  it("有効な指定年月をそのまま返す", () => {
    expect(resolveYearMonth("2025-12", jstMonthStart)).toBe("2025-12");
  });

  it.each([null, "", "2026-13", "1899-12", "2101-01"])(
    "無効な指定年月 %s の場合はJSTの現在年月を返す",
    (requestedMonth) => {
      expect(resolveYearMonth(requestedMonth, jstMonthStart)).toBe("2026-09");
    },
  );
});
