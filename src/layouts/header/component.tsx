import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <header>
    <nav
      className="fixed z-20 w-full bg-gray-700 py-3 text-center font-semibold"
      aria-label="Header navigation"
    >
      <Link href="/">
        <a className="rounded px-5 py-2.5 font-mono tracking-tight no-underline hover:bg-gray-600 active:bg-gray-600 active:ring-2 active:ring-gray-500">
          {props.isPost ? (
            <>
              <span className="text-xs text-gray-100 duration-100">
                {props.name}/
              </span>
              <span className="text-pink-500 opacity-80 duration-1000">
                {props.repository}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-400">{props.name}/</span>
              <span className="text-gray-200">{props.repository}</span>
            </>
          )}
        </a>
      </Link>
    </nav>
  </header>
);
