import Head from "next/head";
import { HomeLink } from "~/components/home-link";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "~/constants/app";
import { Layout } from "~/layouts/layout";
import type { PageComponent } from "./_app";

const Page: PageComponent = () => {
  return (
    <>
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:title" content={`Not Found ･ ${APP_NAME}`} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content={APP_URL} />
      </Head>
      <h1>An error occurred</h1>
      <p className="mb-12">An error occurred.</p>
      <div className="flex justify-center">
        <HomeLink />
      </div>
    </>
  );
};

Page.getLayout = (page) => <Layout title="An error occurred">{page}</Layout>;

export default Page;
