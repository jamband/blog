import Link from "next/link";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <footer>
    <nav
      className="flex justify-center gap-x-5 bg-gray-700 py-3 text-sm"
      aria-label="Footer navigation"
    >
      {props.links.map((link) => (
        <Link key={link.href} href={link.href}>
          <a className="rounded px-5 py-1 no-underline hover:bg-gray-600 hover:text-gray-100 active:bg-gray-600 active:text-gray-100 active:ring-2 active:ring-gray-500">
            {link.text}
          </a>
        </Link>
      ))}
    </nav>
  </footer>
);
