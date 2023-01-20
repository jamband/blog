import { APP_URL } from "@/constants/app";
import { useRouter } from "next/router";
import { Component } from "./component";
import type { Props } from "./types";

export const Layout: React.FC<Props> = (props) => {
  const { asPath } = useRouter();

  const url = APP_URL.replace(/\/$/g, "") + asPath;

  return <Component {...props} url={url} />;
};
