/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import { Loading } from ".";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const router = useRouter as jest.Mock;

beforeEach(() => {
  router.mockReset();
});

test("start: same routes", () => {
  router.mockReturnValue({
    asPath: "/",
    events: {
      on: jest.fn((event, callback) => {
        if (event === "routeChangeStart") {
          callback("/");
        }
      }),
      off: jest.fn(),
    },
  });

  render(<Loading />);
  expect(screen.getByRole("status")).toHaveClass("initial", { exact: true });
});

test("start: different routes", () => {
  router.mockReturnValue({
    asPath: "/",
    events: {
      on: jest.fn((event, callback) => {
        if (event === "routeChangeStart") {
          callback("/foo");
        }
      }),
      off: jest.fn(),
    },
  });

  render(<Loading />);
  expect(screen.getByRole("status")).toHaveClass("initial start", {
    exact: true,
  });
});

test("complete: different routes", async () => {
  router.mockReturnValue({
    asPath: "/",
    events: {
      on: jest.fn((event, callback) => {
        if (event === "routeChangeComplete") {
          callback("/foo");
        }
      }),
      off: jest.fn(),
    },
  });

  render(<Loading />);
  expect(screen.getByRole("status")).toHaveClass("initial", { exact: true });
});
