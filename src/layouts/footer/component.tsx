import Link from "next/link";

export const Component: React.VFC = () => (
  <footer className="bg-gray-800 py-3 text-center font-semibold">
    <nav className="text-sm" aria-label="Footer navigation">
      <Link href="/about">
        <a className="px-5 py-3">About</a>
      </Link>
      <Link href="/contact">
        <a className="px-5 py-3">Contact</a>
      </Link>
    </nav>
  </footer>
);
