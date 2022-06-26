import Head from "next/head";
import { ExternalLink } from "../components/external-link";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "../constants/app";
import { IconExternalLink } from "../icons/external-link";
import { Layout } from "../layouts/layout";

export default function Page() {
  return (
    <>
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:title" content={`About ･ ${APP_NAME}`} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content={`${APP_URL}about/`} />
      </Head>
      <h1>About</h1>
      <p>{APP_DESCRIPTION}</p>
      <p>
        また、このウェブサイトはオープンソースなプロジェクトです。詳細については{" "}
        <ExternalLink
          href={`https://github.com/${APP_NAME}`}
          className="text-pink-500"
        >
          GitHub: {APP_NAME}
          <IconExternalLink className="h-4 w-4 align-[-0.125em]" />
        </ExternalLink>{" "}
        をご覧ください。
      </p>
    </>
  );
}

Page.getLayout = (page: React.ReactElement) => (
  <Layout title="About">{page}</Layout>
);
