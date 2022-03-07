import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <div className="mb-3 text-center text-xs font-semibold text-gray-500">
    {props.copyright}
  </div>
);
