/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import { APP_NAME } from "~/constants/app";
import { Header } from ".";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const router = useRouter as jest.Mock;

beforeEach(() => {
  router.mockReset();
});

test("", () => {
  router.mockReturnValue({
    pathname: "/2030/01/foo",
  });

  render(<Header />);

  const [name, repository] = APP_NAME.split("/");
  expect(screen.getByText(`${name}/`)).toBeInTheDocument();
  expect(screen.getByText(repository)).toBeInTheDocument();
});
