import { APP_DESCRIPTION } from "../constants/app";
import { description } from "./meta";

describe("description", () => {
  test("", () => {
    const content = "<h2>Foo</h2><p>description...</p>";
    expect(description(content)).toBe("description...");
  });

  test("don't have a description section", () => {
    const content = "<h2>Foo</h2>";
    expect(description(content)).toBe(APP_DESCRIPTION);
  });

  test("multiple p tags", () => {
    const content = "<p>description1...</p><p>description2...</p>";
    expect(description(content)).toBe("description1...");
  });

  test("character limit", () => {
    const content = `<p>${"a".repeat(100)}</p>`;
    expect(description(content)).toBe("a".repeat(90));
  });

  test("include some tags", () => {
    const content = `<p><a href="https://example.com">Foo</a> <strong>Bar</strong> Baz</p>`;
    expect(description(content)).toBe("Foo Bar Baz");
  });
});
