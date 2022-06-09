import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <ul className={props.className}>
    {props.tags.map((tag) => (
      <li key={tag} className="mb-1 inline-block">
        <Link
          href={`/tags/${tag}`}
          className={`mr-4 ${
            props.match(tag) ? "text-pint-500" : "text-gray-400"
          }`}
        >
          {tag}
        </Link>
      </li>
    ))}
  </ul>
);
