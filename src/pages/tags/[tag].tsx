import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import type { ParsedUrlQuery } from "querystring";
import { HomeLink } from "~/components/home-link";
import { Tags } from "~/components/tags";
import { APP_DESCRIPTION } from "~/constants/app";
import { Layout } from "~/layouts/layout";
import type { Post } from "~/types/post";
import { getPostsByTag, getTags } from "~/utils/api";
import { formatDate } from "~/utils/format";
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
      <h2 className="mb-8 text-center text-5xl">Tags</h2>
      <Tags tags={props.tags} className="mb-14" />
      <h2 className="mb-8 flex flex-col items-center justify-center text-5xl leading-tight">
        <div>Posts</div>
        <div className="text-[1.25rem] text-pink-500">
          <span className="mr-0.5 align-middle text-sm text-gray-500">#</span>
          {props.tag}
        </div>
      </h2>
      <ul className="mb-6">
        {props.posts.map((post) => (
          <li key={post.slug} className="mb-6">
            <Link
              href={`/${post.year}/${post.month}/${post.slug}`}
              className="font-semibold hover:text-pink-500"
            >
              {post.title}
            </Link>
            <div className="text-xs text-gray-400">
              {formatDate(post.created_at)}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-center">
        <HomeLink />
      </div>
    </>
  );
};

Page.getLayout = (page) => <Layout title={page.props.tag}>{page}</Layout>;

export default Page;
