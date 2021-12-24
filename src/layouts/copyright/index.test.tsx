/** @jest-environment jsdom */
import { render } from "@testing-library/react";
import { Copyright } from ".";

test("", () => {
  const { container } = render(<Copyright />);

  const text = `\u00a9 ${new Date().getFullYear()}`;
  expect(container).toHaveTextContent(text);
});
