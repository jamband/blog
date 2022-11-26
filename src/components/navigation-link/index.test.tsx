import { render, screen } from "@testing-library/react";
import { NavigationLink } from ".";

test("", () => {
  render(<NavigationLink href="/">foo</NavigationLink>);

  const link = screen.getByRole("link", { name: "foo" });
  expect(link).toHaveAttribute("href", "/");
});
