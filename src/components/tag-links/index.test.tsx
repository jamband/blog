import { render, screen } from "@testing-library/react";
import { router } from "~/mocks/router";
import { TagLinks } from ".";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

test("", () => {
  router.mockReturnValue({
    query: { tag: "foo" },
  });
  render(<TagLinks tags={["foo", "bar", "baz"]} />);

  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(3);
  expect(links[0]).toHaveAttribute("href", "/tags/foo");
  expect(links[0]).toHaveClass("bg-pink-600/90");
});
