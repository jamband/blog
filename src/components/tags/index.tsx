import { useRouter } from "next/router";
import { Component } from "./component";
import type { Props } from "./types";

export const Tags: React.FC<Props> = (props) => {
  const { query } = useRouter();
  const match = (tag: string) => query.tag === tag;

  return <Component match={match} {...props} />;
};
