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

  const anchors = screen.getAllByRole("link");
  expect(anchors).toHaveLength(3);
  expect(anchors[0]).toHaveAttribute("href", "/tags/foo");
  expect(anchors[0]).toHaveClass("mr-3", { exact: true });
});

test("decoration: true", () => {
  router.mockReturnValue({
    query: { tag: "foo" },
  });
  render(<Tags tags={["foo", "bar", "baz"]} decoration />);

  const anchors = screen.getAllByRole("link");
  expect(anchors).toHaveLength(3);
  expect(anchors[0]).toHaveAttribute("href", "/tags/foo");
  expect(anchors[0]).toHaveClass("mr-3 text-purple-400", { exact: true });
});
