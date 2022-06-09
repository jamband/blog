import { useRouter } from "next/router";
import { Component } from "./component";
import type { Props } from "./types";

export const Layout: React.FC<Props> = (props) => {
  const { pathname } = useRouter();
  const isPost = pathname === "/[year]/[month]/[slug]" ? true : false;

  return <Component {...props} isPost={isPost} />;
};
