/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { PostHeader } from ".";

test("", () => {
  render(
    <PostHeader
      title="Foo"
      created_at="1999-12-31"
      last_updated="2000-01-01"
      historyUrl={`https://example.com`}
    />
  );

  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Foo" })).toBeInTheDocument();

  const li = screen.getAllByRole("listitem");
  expect(li[0]).toHaveTextContent("作成日: 1999年12月31日");
  expect(li[1]).toHaveTextContent("最終更新日: 2000年01月01日");
  expect(li[2]).toHaveTextContent("更新履歴");

  const time = screen.getByText("最終更新日: 2000年01月01日");
  expect(time).toHaveAttribute("dateTime", "2000-01-01");

  const link = screen.getByRole("link");
  expect(link).toHaveAttribute("href", "https://example.com");
});
