import { IconExternalLink } from "../../icons/external-link";
import { formatDate } from "../../utils/format";
import { ExternalLink } from "../external-link";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <header className="mb-8">
    <h1 className="mb-10">{props.title}</h1>
    <ul className="flex flex-col text-end text-sm leading-relaxed text-gray-400">
      <li>作成日: {formatDate(props.created_at)}</li>
      <li>
        <time dateTime={props.last_updated}>
          最終更新日: {formatDate(props.last_updated)}
        </time>
      </li>
      <li>
        <ExternalLink href={props.historyUrl}>
          更新履歴
          <IconExternalLink className="h-4 w-4 align-[-0.125em]" />
        </ExternalLink>
      </li>
    </ul>
  </header>
);
