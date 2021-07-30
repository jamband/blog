/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { APP_NAME } from "~/constants/app";
import { Page } from ".";

jest.mock("next/head", () => ({
  __esModule: true,
  default: function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  },
}));

test("title: ''", () => {
  render(
    <Page title="">
      <h1>Foo</h1>
    </Page>
  );
  expect(document.title).toBe(APP_NAME);
});

test("title: Foo", () => {
  render(
    <Page title="Foo">
      <h1>Foo</h1>
    </Page>
  );
  expect(document.title).toBe(`Foo · ${APP_NAME}`);
  expect(screen.getByRole("heading", { name: "Foo" })).toBeInTheDocument();
});
