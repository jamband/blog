import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <footer className="py-3 text-center font-semibold bg-gray-800">
    <nav className="text-sm" aria-label="Footer navigation">
      <Link href="/contact">
        <a className="px-3 py-2">Contact</a>
      </Link>
      <Link href="/about">
        <a className="px-3 py-2">About</a>
      </Link>
    </nav>
    <div className="mt-1 text-xs text-gray-400">{props.copyright}</div>
  </footer>
);
