import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <header>
    <nav
      className="fixed w-full py-3 z-20 text-center font-semibold bg-gray-800"
      aria-label="Header navigation"
    >
      <Link href="/">
        <a className="px-5 py-3 no-underline font-mono tracking-tight">
          <span
            className={`text-xs ${
              props.isPost ? "text-gray-100 duration-1000" : "text-gray-400"
            }`}
          >
            {props.name}/
          </span>
          <span
            className={
              props.isPost ? "text-pink-500 opacity-80 duration-1000" : ""
            }
          >
            {props.repository}
          </span>
        </a>
      </Link>
    </nav>
  </header>
);
