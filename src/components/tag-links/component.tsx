import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <ul
    className={`flex max-h-[10.5rem] flex-wrap gap-x-4 gap-y-5 overflow-y-scroll ${
      props.className || ""
    }`}
  >
    {props.tags.map((tag) => (
      <li key={tag}>
        <Link
          href={`/tags/${tag}`}
          className="rounded bg-gray-700 px-4 py-1.5 no-underline hover:text-gray-100 active:text-gray-100"
        >
          <span className="mr-0.5 align-middle text-xs">#</span>
          {tag}
        </Link>
      </li>
    ))}
  </ul>
);
