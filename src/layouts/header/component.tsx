import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <header>
    <nav
      className="fixed w-full py-3 z-20 text-center font-semibold bg-gray-800"
      aria-label="Header navigation"
    >
      <Link href="/">
        <a className="no-underline font-mono tracking-tight">
          <span className="text-xs text-gray-400">{props.name}/</span>
          {props.repository}
        </a>
      </Link>
    </nav>
  </header>
);
