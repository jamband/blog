import Link from "next/link";
import { formatDate } from "~/utils/format";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <ul className={`flex flex-col gap-6 ${props.className || ""}`}>
    {props.posts.map((post) => (
      <li key={post.slug}>
        <Link
          href={`/${post.year}/${post.month}/${post.slug}`}
          className="text-[1.125rem] font-semibold text-gray-200 hover:text-pink-500"
        >
          {post.title}
        </Link>
        <div className="text-xs text-gray-400">
          {formatDate(post.created_at)}
        </div>
      </li>
    ))}
  </ul>
);
