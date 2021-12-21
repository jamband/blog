/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import { Tags } from ".";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const router = useRouter as jest.Mock;

beforeEach(() => {
  router.mockReset();
});

test("", () => {
  render(<Tags tags={["foo", "bar", "baz"]} />);

  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(3);
  expect(links[0]).toHaveAttribute("href", "/tags/foo");
  expect(links[0]).toHaveClass("mr-4", { exact: true });
});

test("decoration: true", () => {
  router.mockReturnValue({
    query: { tag: "foo" },
  });
  render(<Tags tags={["foo", "bar", "baz"]} decoration />);

  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(3);
  expect(links[0]).toHaveAttribute("href", "/tags/foo");
  expect(links[0]).toHaveClass("mr-4 text-pink-500", { exact: true });
});
