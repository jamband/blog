/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { Footer } from ".";

test("", () => {
  render(<Footer />);

  const aboutLink = screen.getByRole("link", { name: "About" });
  expect(aboutLink).toHaveAttribute("href", "/about");

  const contactLink = screen.getByRole("link", { name: "Contact" });
  expect(contactLink).toHaveAttribute("href", "/contact");
});
