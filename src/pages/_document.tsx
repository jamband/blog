import { Head, Html, Main, NextScript } from "next/document";
import { APP_NAME } from "../constants/app";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={APP_NAME} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
