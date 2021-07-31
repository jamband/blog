/** @jest-environment jsdom */
import { render } from "@testing-library/react";
import { Footer } from ".";

test("", () => {
  const { container } = render(<Footer />);

  const text = `\u00a9 ${new Date().getFullYear()}`;
  expect(container).toHaveTextContent(text);
});
