/** @jest-environment jsdom */
import { render } from "@testing-library/react";
import { Title } from ".";
import { APP_NAME } from "../../constants/app";

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

test("title: ''", () => {
  render(<Title title="" />);
  expect(document.title).toBe(APP_NAME);
});

test("title: Foo", () => {
  render(<Title title="Foo" />);
  expect(document.title).toBe(`Foo · ${APP_NAME}`);
});
