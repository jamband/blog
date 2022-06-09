import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <header>
    <nav
      className="fixed z-20 w-full bg-gray-700 py-3 text-center font-semibold"
      aria-label="Header navigation"
    >
      <Link
        href="/"
        className="px-5 py-3 font-mono tracking-tight no-underline"
      >
        <span
          className={`text-xs ${
            props.isPost ? "text-gray-100 duration-1000" : "text-gray-400"
          }`}
        >
          {props.name}/
        </span>
        <span
          className={
            props.isPost
              ? "text-pink-500 opacity-80 duration-1000"
              : "text-gray-200"
          }
        >
          {props.repository}
        </span>
      </Link>
    </nav>
  </header>
);
