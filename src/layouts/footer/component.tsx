import Link from "next/link";

export const Component: React.FC = () => (
  <footer className="bg-gray-700 py-4 text-center font-semibold">
    <nav className="text-sm" aria-label="Footer navigation">
      <Link
        href="/about"
        className="px-5 py-3 text-gray-300 no-underline active:text-gray-100"
      >
        About
      </Link>
      <Link
        href="/contact"
        className="px-5 py-3 text-gray-300 no-underline active:text-gray-100"
      >
        Contact
      </Link>
    </nav>
  </footer>
);
