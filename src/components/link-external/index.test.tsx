/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { LinkExternal } from ".";

test("", () => {
  render(<LinkExternal href="https://example.com">foo</LinkExternal>);

  const link = screen.getByRole("link", { name: "foo" });
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(link).toHaveAttribute("target", "_blank");
});
