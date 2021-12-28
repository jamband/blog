import { useRouter } from "next/router";
import { Component } from "./component";
import type { Props } from "./types";

export const Tags: React.VFC<Props> = (props) => {
  const { query } = useRouter();

  const linkClass = (tag: string) => {
    let selector = "mr-4";
    if (props.decoration && query.tag === tag) {
      selector += " text-pink-500";
    }
    return selector;
  };
  return <Component {...props} linkClass={linkClass} />;
};
