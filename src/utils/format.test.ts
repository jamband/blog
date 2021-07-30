import { formatDate } from "./format";

test("1999-12-31", () => {
  expect(formatDate("1999-12-31")).toBe("Dec 31, 1999");
});

test("2000-01-01", () => {
  expect(formatDate("2000-01-01")).toBe("Jan 01, 2000");
});
