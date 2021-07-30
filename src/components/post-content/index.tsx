import { Component } from "./component";
import { Props } from "./types";

export const PostContent: React.VFC<Props> = (props) => {
  return <Component {...props} />;
};
