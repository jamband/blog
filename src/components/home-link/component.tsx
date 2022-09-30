import Link from "next/link";

export const Component: React.FC = () => (
  <Link href="/">
    <a className="inline-flex rounded bg-gray-700 px-4 py-1 text-sm text-gray-400 no-underline hover:text-gray-100 active:text-gray-100 active:ring-2 active:ring-gray-500">
      ← home
    </a>
  </Link>
);
