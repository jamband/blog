import Head from "next/head";
import { HomeLink } from "../components/home-link";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "../constants/app";
import { Page } from "../layouts/page";

export default function View() {
  return (
    <Page title="Not Found">
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
    </Page>
  );
}
