import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <ul className={`flex flex-wrap gap-4 ${props.className || ""}`}>
    {props.tags.map((tag) => (
      <li key={tag}>
        <Link href={`/tags/${tag}`}>
          <a
            className={`rounded bg-gray-700 px-4 py-1.5 no-underline hover:text-gray-100 active:text-gray-100 ${
              props.match(tag) ? "bg-pink-600/90 text-pink-100" : ""
            }`}
          >
            {tag}
          </a>
        </Link>
      </li>
    ))}
  </ul>
);
