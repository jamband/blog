import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <a
    href={props.href}
    className={props.className}
    rel="noopener noreferrer"
    target="_blank"
  >
    {props.children}
  </a>
);
