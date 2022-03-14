import Link from "next/link";

export const Component: React.VFC = () => (
  <Link href="/">
    <a className="rounded bg-gray-700 px-5 py-3 text-gray-200 no-underline active:text-pink-500">
      ← Home
    </a>
  </Link>
);
