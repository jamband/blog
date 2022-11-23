import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Tags } from "~/components/tags";
import { APP_DESCRIPTION } from "~/constants/app";
import { Layout } from "~/layouts/layout";
import type { Post } from "~/types/post";
import { getLatestPosts, getTags } from "~/utils/api";
import { formatDate } from "~/utils/format";
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
      <h2 className="mb-8 text-center text-5xl">Tags</h2>
      <Tags tags={props.tags} className="mb-14" />
      <h2 className="mb-8 flex flex-col items-center justify-center text-5xl leading-tight">
        <div>Posts</div>
        <div className="text-[1.25rem] text-pink-500">latest</div>
      </h2>
      <ul>
        {props.latestPosts.map((post) => (
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
        <Link
          href="/posts"
          className="rounded bg-gray-700 px-4 py-1 text-sm text-gray-400 no-underline hover:text-gray-100 active:text-gray-100 active:ring-2 active:ring-gray-400"
        >
          see all →
        </Link>
      </div>
    </>
  );
};

Page.getLayout = (page) => <Layout title="">{page}</Layout>;

export default Page;
