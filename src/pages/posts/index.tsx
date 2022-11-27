import type { GetStaticProps } from "next";
import Head from "next/head";
import { NavigationLink } from "~/components/navigation-link";
import { PostCollection } from "~/components/post-collection";
import { Tags } from "~/components/tags";
import { APP_DESCRIPTION } from "~/constants/app";
import { Layout } from "~/layouts/layout";
import type { Post } from "~/types/post";
import { getPosts, getTags } from "~/utils/api";
import type { PageComponent } from "../_app";

type Props = {
  tags: Array<string>;
  posts: Array<Post>;
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      tags: getTags(),
      posts: getPosts(),
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
      <Tags tags={props.tags} className="mb-14" />
      <h1 className="mb-12 flex flex-col items-center justify-center leading-tight">
        <div>Posts</div>
        <div className="text-[1.25rem] text-pink-500">all</div>
      </h1>
      <PostCollection posts={props.posts} className="mb-16" />
      <NavigationLink href="/" className="flex justify-center">
        ← home
      </NavigationLink>
    </>
  );
};

Page.getLayout = (page) => <Layout title="posts">{page}</Layout>;

export default Page;
