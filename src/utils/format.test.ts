import { formatDate } from "./format";

describe("formatDate", () => {
  test("1999-12-31", () => {
    expect(formatDate("1999-12-31")).toBe("December 31, 1999");
  });

  test("2000-01-01", () => {
    expect(formatDate("2000-01-01")).toBe("January 01, 2000");
  });
});
