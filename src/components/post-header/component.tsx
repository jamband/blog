import { IconExternalLink } from "~/icons/external-link";
import { formatDate } from "~/utils/format";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <header className="mb-8">
    <h1 className="mb-12 text-center text-4xl">{props.title}</h1>
    <ul className="flex flex-col items-end text-sm text-gray-400">
      <li>作成日: {formatDate(props.created_at)}</li>
      <li>
        <time dateTime={props.last_updated}>
          最終更新日: {formatDate(props.last_updated)}
        </time>
      </li>
      <li>
        <a
          href={props.historyUrl}
          className="hover:text-pink-500"
          target="_blank"
          rel="noreferrer"
        >
          更新履歴
          <IconExternalLink className="h-4 w-4 align-[-0.125em]" />
        </a>
      </li>
    </ul>
  </header>
);
