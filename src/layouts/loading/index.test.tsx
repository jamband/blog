import { render, screen } from "@testing-library/react";
import { router } from "~/mocks/router";
import { Loading } from ".";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

test("", () => {
  router.mockReturnValue({
    asPath: "/",
    events: {
      on: jest.fn((event, callback) => {
        if (event === "routeChangeStart") {
          callback("/");
        }
      }),
      off: jest.fn(),
    },
  });

  render(<Loading />);

  expect(screen.getByRole("status")).toHaveClass("fixed w-[99%]");
});
