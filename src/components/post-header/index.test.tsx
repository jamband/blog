/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { PostHeader } from ".";

test("", () => {
  render(<PostHeader title="Foo" date="1999-12-31" />);

  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Foo" })).toBeInTheDocument();

  const time = screen.getByText("December 31, 1999");
  expect(time).toHaveAttribute("dateTime", "1999-12-31");
});
