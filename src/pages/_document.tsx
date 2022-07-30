import { Head, Html, Main, NextScript } from "next/document";
import { APP_NAME } from "../constants/app";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={APP_NAME} />
        <meta
          name="google-site-verification"
          content="6aK91se27OEvK0J9CLA7PvKK6qO7BkcncLYKFIQz8rY"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
