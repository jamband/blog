import { NavigationLink } from "@/components/navigation-link";
import { APP_DESCRIPTION } from "@/constants/app";
import { Layout } from "@/layouts/layout";
import Head from "next/head";
import type { PageComponent } from "./_app";

const Page: PageComponent = () => {
  return (
    <>
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:description" content={APP_DESCRIPTION} />
      </Head>
      <article className="flex h-[70vh] items-center justify-center">
        <section className="text-center">
          <h1>An error occurred</h1>
          <p className="mb-16">An error occurred.</p>
          <NavigationLink href="/" className="flex justify-center">
            ← home
          </NavigationLink>
        </section>
      </article>
    </>
  );
};

Page.getLayout = (page) => <Layout title="An error occurred">{page}</Layout>;

export default Page;
