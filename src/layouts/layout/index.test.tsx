/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import { Layout } from ".";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../loading", () => ({
  Loading: jest.fn(() => null),
}));

jest.mock("../header", () => ({
  Header: jest.fn(() => null),
}));

jest.mock("../copyright", () => ({
  Copyright: jest.fn(() => "copyright"),
}));

jest.mock("../footer", () => ({
  Footer: jest.fn(() => null),
}));

const router = useRouter as jest.Mock;

beforeEach(() => {
  router.mockReset();
});

test("", () => {
  router.mockReturnValue({
    pathname: "/",
  });

  render(<Layout title="">foo</Layout>);

  expect(screen.getByText("foo")).toBeInTheDocument();
});

test("copyright", () => {
  router.mockReturnValue({
    pathname: "/[year]/[month]/[slug]",
  });

  render(<Layout title="">foo</Layout>);

  expect(screen.getByText("foo")).toBeInTheDocument();
});
