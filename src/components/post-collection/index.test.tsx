import { render, screen, within } from "@testing-library/react";
import { PostCollection } from ".";

test("", () => {
  render(
    <PostCollection
      posts={[
        {
          title: "title2",
          created_at: "2000-01-01",
          last_updated: "2000-01-01",
          year: "2000",
          month: "01",
          slug: "baz-qux",
          tags: ["tag1", "tag2"],
        },
        {
          title: "title1",
          created_at: "1999-12-31",
          last_updated: "1999-12-31",
          year: "1999",
          month: "12",
          slug: "foo-bar",
          tags: ["tag1", "tag2"],
        },
      ]}
    />
  );

  const listitems = screen.getAllByRole("listitem");
  expect(listitems).toHaveLength(2);

  expect(
    within(listitems[0]).getByRole("link", { name: "title2" })
  ).toHaveAttribute("href", "/2000/01/baz-qux");

  expect(within(listitems[0]).getByText("2000年01月01日")).toBeInTheDocument();

  expect(
    within(listitems[1]).getByRole("link", { name: "title1" })
  ).toHaveAttribute("href", "/1999/12/foo-bar");

  expect(within(listitems[1]).getByText("1999年12月31日")).toBeInTheDocument();
});
