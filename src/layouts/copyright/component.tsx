import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <div className="mb-3 flex justify-center text-xs font-semibold text-gray-400">
    {props.copyright}
  </div>
);
