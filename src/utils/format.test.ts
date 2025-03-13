import { describe, expect, test } from "vitest";
import { dateFormat } from "./format";

describe("dateFormat", () => {
  test("1999-12-31", () => {
    expect(dateFormat("1999-12-31")).toBe("1999年12月31日");
  });

  test("2000-01-01", () => {
    expect(dateFormat("2000-01-01")).toBe("2000年01月01日");
  });
});
