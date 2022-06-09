/** @jest-environment jsdom */
import { render } from "@testing-library/react";
import { Page } from ".";
import { APP_NAME } from "../../constants/app";

jest.mock("next/head", () => ({
  __esModule: true,
  default: function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  },
}));

test("title: ''", () => {
  render(<Page title="" />);
  expect(document.title).toBe(APP_NAME);
});

test("title: Foo", () => {
  render(<Page title="Foo" />);
  expect(document.title).toBe(`Foo · ${APP_NAME}`);
});
