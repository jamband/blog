import { formatDate } from "./format";

describe("formatDate", () => {
  test("1999-12-31", () => {
    expect(formatDate("1999-12-31")).toBe("1999年12月31日");
  });

  test("2000-01-01", () => {
    expect(formatDate("2000-01-01")).toBe("2000年01月01日");
  });
});
