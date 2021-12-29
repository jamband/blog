import Head from "next/head";
import { LinkExternal } from "~/components/link-external";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "~/constants/app";
import { IconExternalLink } from "~/icons/external-link";
import { Page } from "~/layouts/page";

export default function View() {
  return (
    <Page title="Contact">
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:title" content={`Contact ･ ${APP_NAME}`} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content={`${APP_URL}contact/`} />
      </Head>
      <h1>Contact</h1>
      <p>
        何かしらの問い合わせに関しては{" "}
        <LinkExternal
          href="https://twitter.com/livejam_db"
          className="inline-flex items-center"
        >
          Twitter
          <IconExternalLink className="ml-0.5 h-4 w-4" />
        </LinkExternal>{" "}
        のダイレクトメッセージからお願いします。
      </p>
      <p>
        また、プログラムのバグなどを発見した場合は{" "}
        <LinkExternal
          href={`https://github.com/${APP_NAME}/issues`}
          className="inline-flex items-center"
        >
          GitHub Issues
          <IconExternalLink className="ml-0.5 h-4 w-4" />
        </LinkExternal>{" "}
        から報告してもらえると助かります。
      </p>
    </Page>
  );
}
