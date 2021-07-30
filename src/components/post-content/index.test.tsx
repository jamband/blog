/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { PostContent } from ".";

test("", () => {
  render(<PostContent content="<h1>Foo</h1>" />);
  expect(screen.getByRole("heading", { name: "Foo" })).toBeInTheDocument();
});
