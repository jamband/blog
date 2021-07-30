import Document, { Html, Head, Main, NextScript } from "next/document";
import { APP_DESCRIPTION } from "~/constants/app";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          <meta name="description" content={APP_DESCRIPTION} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
