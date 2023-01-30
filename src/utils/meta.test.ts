import { describe, expect, test } from "vitest";
import { description } from "./meta";

describe("description", () => {
  test("", () => {
    const content = `## はじめに\n\nあーだこーだ。`;
    expect(description(content)).toBe("あーだこーだ。");
  });

  test("multiple sections", () => {
    const content =
      "## はじめに\n\nあーだこーだ。\n\n## 環境\n\nあーだこーだ。";
    expect(description(content)).toBe("あーだこーだ。あーだこーだ。");
  });

  test("character limit", () => {
    const content = `## はじめに\n\n${"a".repeat(100)}`;
    expect(description(content)).toBe("a".repeat(90));
  });

  test("include some tags", () => {
    const content = `## はじめに\n\n[あーだ](https://example.com)こーだ。`;
    expect(description(content)).toBe("あーだこーだ。");
  });
});
