import { render, screen } from "@testing-library/react";
import { Footer } from ".";

test("", () => {
  render(<Footer />);

  expect(screen.getByText(/Tomoki Morita/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
});
