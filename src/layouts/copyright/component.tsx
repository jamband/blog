import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <div className="mb-3 font-semibold text-center text-xs text-gray-500">
    {props.copyright}
  </div>
);
