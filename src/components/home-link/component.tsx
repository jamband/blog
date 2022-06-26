import Link from "next/link";

export const Component: React.FC = () => (
  <Link
    href="/"
    className="inline-flex rounded bg-gray-700 px-4 py-1 text-sm text-gray-200 no-underline active:text-pink-500"
  >
    ← トップページに戻る
  </Link>
);
