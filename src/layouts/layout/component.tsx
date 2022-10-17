import Head from "next/head";
import { APP_NAME } from "~/constants/app";
import { Footer } from "../footer";
import { Header } from "../header";
import { Loading } from "../loading";
import { Title } from "../title";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width,viewport-fit=cover" />
      <meta
        name="google-site-verification"
        content="6aK91se27OEvK0J9CLA7PvKK6qO7BkcncLYKFIQz8rY"
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:url" content={props.url} />
    </Head>
    <Title title={props.title} />
    <Loading />
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto grow pt-28 pb-10">
        {props.children}
      </main>
      <Footer />
    </div>
  </>
);
