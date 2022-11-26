import type { UrlObject } from "url";

export type Props = {
  href: string | UrlObject;
  className?: string;
  children: React.ReactNode;
};

export type _Props = Props;
