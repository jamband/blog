import { Component } from "./component";
import type { Props } from "./types";

export const Layout: React.VFC<Props> = (props) => {
  return <Component {...props} />;
};
