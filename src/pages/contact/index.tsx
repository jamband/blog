import Head from "next/head";
import { ExternalLink } from "~/components/external-link";
import { APP_DESCRIPTION, APP_REPOSITORY_URL } from "~/constants/app";
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
      <h1>Contact</h1>
      <p>
        何かしらの問い合わせに関しては{" "}
        <ExternalLink
          href="https://twitter.com/livejam_db"
          className="text-pink-500"
        >
          Twitter
          <IconExternalLink className="h-4 w-4 align-[-0.125em]" />
        </ExternalLink>{" "}
        のダイレクトメッセージからお願いします。
      </p>
      <p>
        また、プログラムのバグなどを発見した場合は{" "}
        <ExternalLink
          href={`${APP_REPOSITORY_URL}/issues`}
          className="text-pink-500"
        >
          GitHub Issues
          <IconExternalLink className="h-4 w-4 align-[-0.125em]" />
        </ExternalLink>{" "}
        から報告してもらえると助かります。
      </p>
    </>
  );
};

Page.getLayout = (page) => <Layout title="Contact">{page}</Layout>;

export default Page;
