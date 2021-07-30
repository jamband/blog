import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <footer className="py-3 text-center font-semibold bg-gray-800">
    <nav className="text-sm" aria-label="Footer navigation">
      <Link href="/contact">
        <a className="mr-3">Contact</a>
      </Link>
      <Link href="/about">
        <a>About</a>
      </Link>
    </nav>
    <div className="text-xs text-gray-400">{props.copyright}</div>
  </footer>
);
