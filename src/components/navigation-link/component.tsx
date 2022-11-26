import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <div className={props.className}>
    <Link
      href={props.href}
      className="rounded bg-gray-700 px-4 py-1 text-sm text-gray-400 no-underline hover:text-gray-100 active:text-gray-100 active:ring-2 active:ring-gray-400"
    >
      {props.children}
    </Link>
  </div>
);
