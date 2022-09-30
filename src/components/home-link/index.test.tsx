/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { HomeLink } from ".";

test("", () => {
  render(<HomeLink />);

  const link = screen.getByRole("link", { name: "← home" });
  expect(link).toHaveAttribute("href", "/");
});
