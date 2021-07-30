import { APP_DESCRIPTION } from "~/constants/app";
import { description } from "./meta";

describe("description", () => {
  test("", () => {
    const content = "<h1>Foo<h1><p>description...</p>";
    expect(description(content)).toBe("description...");
  });

  test("don't have a description section", () => {
    const content = "<h1>Foo</h1>";
    expect(description(content)).toBe(APP_DESCRIPTION);
  });
});
