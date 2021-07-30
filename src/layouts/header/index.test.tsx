/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { APP_NAME } from "~/constants/app";
import { Header } from ".";

test("", () => {
  render(<Header />);

  const [name, repository] = APP_NAME.split("/");
  expect(screen.getByText(`${name}/`)).toBeInTheDocument();
  expect(screen.getByText(repository)).toBeInTheDocument();
});
