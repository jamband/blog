/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import { Layout } from ".";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("~/layouts/header", () => ({
  Header: jest.fn(() => null),
}));

jest.mock("~/layouts/copyright", () => ({
  Copyright: jest.fn(() => "copyright"),
}));

jest.mock("~/layouts/footer", () => ({
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

  render(<Layout>foo</Layout>);

  expect(screen.getByText("foo")).toBeInTheDocument();
  expect(screen.queryByText("copyright")).not.toBeInTheDocument();
});

test("copyright", () => {
  router.mockReturnValue({
    pathname: "/[year]/[month]/[slug]",
  });

  render(<Layout>foo</Layout>);

  expect(screen.getByText("foo")).toBeInTheDocument();
  expect(screen.getByText("copyright")).toBeInTheDocument();
});
