import Head from "next/head";
import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <div>
    <Head>
      <title>{props.title}</title>
    </Head>
    {props.children}
  </div>
);
