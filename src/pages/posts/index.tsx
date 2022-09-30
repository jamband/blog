import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { HomeLink } from "~/components/home-link";
import { Tags } from "~/components/tags";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "~/constants/app";
import { Layout } from "~/layouts/layout";
import type { Post } from "~/types/post";
import { getPosts, getTags } from "~/utils/api";
import { formatDate } from "~/utils/format";
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
        <meta property="og:title" content={`posts ･ ${APP_NAME}`} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content={`${APP_URL}/posts/`} />
      </Head>
      <h2 className="mb-5 text-4xl">Tags</h2>
      <Tags tags={props.tags} className="mb-14" />
      <h2 className="mb-5 text-4xl">
        Posts <span className="text-[60%] text-gray-400">/</span>{" "}
        <span className="text-[60%] text-pink-500">all</span>
      </h2>
      <ul>
        {props.posts.map((post) => (
          <li key={post.slug} className="mb-6">
            <Link href={`/${post.year}/${post.month}/${post.slug}`}>
              <a className="font-semibold hover:text-pink-500">{post.title}</a>
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

Page.getLayout = (page) => <Layout title="posts">{page}</Layout>;

export default Page;
