import { HomeLink } from "~/components/home-link";
import { Page } from "~/layouts/page";

export default function View() {
  return (
    <Page title="Not Found">
      <h1>Not Found</h1>
      <p>Page not found.</p>
      <div className="mt-12 text-center">
        <HomeLink />
      </div>
    </Page>
  );
}
