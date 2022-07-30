import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <ul className={`flex flex-wrap gap-x-4 gap-y-2 ${props.className || ""}`}>
    {props.tags.map((tag) => (
      <li key={tag}>
        <Link href={`/tags/${tag}`}>
          <a className={`${props.match(tag) ? "text-pink-500" : ""}`}>{tag}</a>
        </Link>
      </li>
    ))}
  </ul>
);
