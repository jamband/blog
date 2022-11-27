import { render, screen } from "@testing-library/react";
import { TagLinks } from ".";

test("", () => {
  render(<TagLinks tags={["foo", "bar", "baz"]} />);

  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(3);
  expect(links[0]).toHaveAttribute("href", "/tags/foo");
});
