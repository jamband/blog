import Head from "next/head";
import { HomeLink } from "../components/home-link";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "../constants/app";
import { Layout } from "../layouts/layout";

export default function Page() {
  return (
    <>
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:title" content={`Not Found ･ ${APP_NAME}`} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content={APP_URL} />
      </Head>
      <h1>Not Found</h1>
      <p>Page not found.</p>
      <div className="mt-12 text-center">
        <HomeLink />
      </div>
    </>
  );
}

Page.getLayout = (page: React.ReactElement) => (
  <Layout title="Not Found">{page}</Layout>
);
