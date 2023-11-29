import { description } from "./meta";

describe("description", () => {
  test("", () => {
    const content = "## はじめに\nあーだこーだ。";
    expect(description(content)).toBe("あーだこーだ。");
  });

  test("trim", () => {
    const content = " ## はじめに\nあーだこーだ。 ";
    expect(description(content)).toBe("あーだこーだ。");
  });

  test("multiple sections", () => {
    const content = "## はじめに\nあーだこーだ。\n## 環境\nあーだこーだ。";
    expect(description(content)).toBe("あーだこーだ。あーだこーだ。");
  });

  test("character limit", () => {
    const content = `## はじめに\n${"a".repeat(100)}`;
    expect(description(content)).toBe("a".repeat(90));
  });

  test("include some special character", () => {
    const content = `## はじめに\nあー [だ](https://example.com) こーだ。`;
    expect(description(content)).toBe("あー だ こーだ。");
  });

  test("include some special character", () => {
    const content = `## はじめに\nあー (だ) こーだ。`;
    expect(description(content)).toBe("あー (だ) こーだ。");
  });
});
