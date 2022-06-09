/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { ExternalLink } from ".";

test("", () => {
  render(<ExternalLink href="https://example.com">foo</ExternalLink>);

  const link = screen.getByRole("link", { name: "foo" });
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(link).toHaveAttribute("target", "_blank");
});
