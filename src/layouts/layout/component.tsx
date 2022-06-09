import Head from "next/head";
import { Copyright } from "../copyright";
import { Footer } from "../footer";
import { Header } from "../header";
import { Loading } from "../loading";
import { Title } from "../title";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
    </Head>
    <Title title={props.title} />
    <Loading />
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-grow pt-28 pb-10">
        {props.children}
      </main>
      <Copyright />
      <Footer />
    </div>
  </>
);
