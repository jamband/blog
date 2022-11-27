import type { GetStaticProps } from "next";
import Head from "next/head";
import type { ParsedUrlQuery } from "querystring";
import { NavigationLink } from "~/components/navigation-link";
import { PostCollection } from "~/components/post-collection";
import { Tags } from "~/components/tags";
import { APP_DESCRIPTION } from "~/constants/app";
import { Layout } from "~/layouts/layout";
import type { Post } from "~/types/post";
import { getPostsByTag, getTags } from "~/utils/api";
import type { PageComponent } from "../_app";

type Props = {
  posts: Array<Post>;
  tags: Array<string>;
  tag: string;
};

type Params = ParsedUrlQuery & {
  tag: string;
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  const tag = params?.tag || "";

  return {
    props: {
      posts: getPostsByTag(tag),
      tags: getTags(),
      tag,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: getTags().map((tag) => ({
      params: {
        tag,
      },
    })),
    fallback: false,
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
        <div className="text-[1.25rem] text-pink-500">
          <span className="mr-0.5 align-middle text-sm">#</span>
          {props.tag}
        </div>
      </h1>
      <PostCollection posts={props.posts} className="mb-16" />
      <NavigationLink href="/" className="flex justify-center">
        ← home
      </NavigationLink>
    </>
  );
};

Page.getLayout = (page) => <Layout title={`#${page.props.tag}`}>{page}</Layout>;

export default Page;
