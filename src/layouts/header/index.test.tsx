import { APP_NAME } from "@/constants/app";
import { router } from "@/mocks/router";
import { render, screen } from "@testing-library/react";
import { Header } from ".";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

test("", () => {
  router.mockReturnValue({
    pathname: "/",
  });

  render(<Header />);

  const [name, repository] = APP_NAME.split("/");
  expect(screen.getByText(`${name}/`)).toBeInTheDocument();

  const element = screen.getByText(repository);
  expect(element).toHaveClass("text-gray-200");
});

test("repository element", () => {
  router.mockReturnValue({
    pathname: "/[year]/[month]/[slug]",
  });

  render(<Header />);

  const [name, repository] = APP_NAME.split("/");
  expect(screen.getByText(`${name}/`)).toBeInTheDocument();

  const element = screen.getByText(repository);
  expect(element).toHaveClass("text-pink-500/80");
});
