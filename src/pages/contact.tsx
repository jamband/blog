import { LinkExternal } from "~/components/link-external";
import { APP_NAME } from "~/constants/app";
import { Page } from "~/layouts/page";

export default function View() {
  return (
    <Page title="Contact">
      <h1>Contact</h1>
      <p>
        何かしらの問い合わせに関しては{" "}
        <LinkExternal href="https://twitter.com/livejam_db">
          Twitter
        </LinkExternal>{" "}
        のダイレクトメッセージからお願いします。
      </p>
      <p>
        また、プログラムのバグなどを発見した場合は{" "}
        <LinkExternal href={`https://github.com/${APP_NAME}/issues`}>
          GitHub Issues{" "}
        </LinkExternal>
        から報告してもらえると助かります。
      </p>
    </Page>
  );
}
