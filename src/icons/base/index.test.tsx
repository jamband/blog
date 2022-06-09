/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { Icon } from ".";

test("", () => {
  render(
    <Icon className="h-4 w-4" viewBox="0 0 20 20">
      icon
    </Icon>
  );

  const imageElement = screen.getByText("icon");
  expect(imageElement).toHaveAttribute("viewBox", "0 0 20 20");
  expect(imageElement).toHaveClass("inline-block h-4 w-4", { exact: true });
  expect(imageElement).not.toHaveAccessibleName("img");
  expect(imageElement).toHaveAttribute("role", "img");
  expect(imageElement).toHaveAttribute("aria-hidden", "true");
});
