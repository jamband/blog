/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { HomeLink } from ".";

test("", () => {
  render(<HomeLink />);

  const link = screen.getByRole("link", { name: "← トップページに戻る" });
  expect(link).toHaveAttribute("href", "/");
});
