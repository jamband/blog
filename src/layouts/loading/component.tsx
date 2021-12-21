import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <div className={props.className} role="status" />
);
