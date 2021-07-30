import { LinkExternal } from "~/components/link-external";
import { APP_DESCRIPTION, APP_NAME } from "~/constants/app";
import { Page } from "~/layouts/page";

export default function View() {
  return (
    <Page title="About">
      <h1>About</h1>
      <p>{APP_DESCRIPTION}</p>
      <p>
        また、このウェブサイトはオープンソースなプロジェクトです。詳細については{" "}
        <LinkExternal href={`https://github.com/${APP_NAME}`}>
          GitHub: {APP_NAME}
        </LinkExternal>{" "}
        をご覧ください。
      </p>
    </Page>
  );
}
