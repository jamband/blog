import { useRouter } from "next/router";
import { Component } from "./component";
import type { Props } from "./types";

export const Tags: React.VFC<Props> = (props) => {
  const router = useRouter();

  const linkClass = (tag: string) => {
    let selector = "mr-4";
    if (props.decoration && router.query.tag === tag) {
      selector += " text-purple-400";
    }
    return selector;
  };
  return <Component {...props} linkClass={linkClass} />;
};
