import Head from "next/head";
import { ExternalLink } from "~/components/external-link";
import { APP_DESCRIPTION, APP_NAME, APP_REPOSITORY_URL } from "~/constants/app";
import { IconExternalLink } from "~/icons/external-link";
import { Layout } from "~/layouts/layout";
import type { PageComponent } from "../_app";

const Page: PageComponent = () => {
  return (
    <>
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:description" content={APP_DESCRIPTION} />
      </Head>
      <h1>About</h1>
      <p>{APP_DESCRIPTION}</p>
      <p>
        また、このウェブサイトはオープンソースなプロジェクトです。詳細については{" "}
        <ExternalLink href={APP_REPOSITORY_URL} className="text-pink-500">
          GitHub: {APP_NAME}
          <IconExternalLink className="h-4 w-4 align-[-0.125em]" />
        </ExternalLink>{" "}
        をご覧ください。
      </p>
    </>
  );
};

Page.getLayout = (page) => <Layout title="About">{page}</Layout>;

export default Page;
