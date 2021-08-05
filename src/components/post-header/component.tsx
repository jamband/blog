import { formatDate } from "~/utils/format";
import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <header className="mb-8">
    <h1 className="mb-8">{props.title}</h1>
    <div className="italic text-right text-sm text-gray-400">
      <time dateTime={props.date}>{formatDate(props.date)}</time>
    </div>
  </header>
);
