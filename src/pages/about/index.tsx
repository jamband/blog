import Head from "next/head";
import { NavigationLink } from "~/components/navigation-link";
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
      <h1 className="mb-12 text-center">About</h1>
      <p>{APP_DESCRIPTION}</p>
      <p className="mb-16">
        また、このウェブサイトはオープンソースなプロジェクトです。詳細については{" "}
        <a
          href={APP_REPOSITORY_URL}
          className="text-pink-500"
          target="_blank"
          rel="noreferrer"
        >
          GitHub: {APP_NAME}
          <IconExternalLink className="h-4 w-4 align-[-0.125em]" />
        </a>{" "}
        をご覧ください。
      </p>
      <NavigationLink href="/" className="flex justify-center">
        ← home
      </NavigationLink>
    </>
  );
};

Page.getLayout = (page) => <Layout title="About">{page}</Layout>;

export default Page;
