import type { GetStaticProps } from "next";
import Head from "next/head";
import { NavigationLink } from "~/components/navigation-link";
import { PostCollection } from "~/components/post-collection";
import { TagLinks } from "~/components/tag-links";
import { APP_DESCRIPTION } from "~/constants/app";
import { Layout } from "~/layouts/layout";
import type { Post } from "~/types/post";
import { getLatestPosts, getTags } from "~/utils/api";
import type { PageComponent } from "./_app";

type Props = {
  tags: Array<string>;
  latestPosts: Array<Post>;
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      tags: getTags(),
      latestPosts: getLatestPosts(),
    },
  };
};

const Page: PageComponent<Props> = (props) => {
  return (
    <>
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:description" content={APP_DESCRIPTION} />
      </Head>
      <TagLinks tags={props.tags} className="mb-14" />
      <h1 className="mb-12 flex flex-col items-center justify-center leading-tight">
        <div>Posts</div>
        <div className="text-[1.25rem] text-pink-500">latest</div>
      </h1>
      <PostCollection posts={props.latestPosts} className="mb-16" />
      <NavigationLink href="/posts" className="flex justify-center">
        see all →
      </NavigationLink>
    </>
  );
};

Page.getLayout = (page) => <Layout title="">{page}</Layout>;

export default Page;
