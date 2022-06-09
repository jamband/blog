import Head from "next/head";
import Link from "next/link";
import { HomeLink } from "../../components/home-link";
import { Tags } from "../../components/tags";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "../../constants/app";
import { Layout } from "../../layouts/layout";
import type { Post } from "../../types/post";
import { getPostsByTag, getTags } from "../../utils/api";
import { formatDate } from "../../utils/format";

type Props = {
  posts: Post[];
  tags: string[];
  tag: string;
};

type Params = {
  params: {
    tag: string;
  };
};

export const getStaticProps = async ({ params }: Params) => {
  return {
    props: {
      posts: getPostsByTag(params.tag),
      tags: getTags(),
      tag: params.tag,
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

export default function Page(props: Props) {
  return (
    <>
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:title" content={`${props.tag} ･ ${APP_NAME}`} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content={`${APP_URL}tags/${props.tag}/`} />
      </Head>
      <h2 className="mb-5 text-4xl">Tags</h2>
      <Tags tags={props.tags} className="mb-14" decoration />
      <h2 className="mb-4 text-4xl">
        Posts <span className="text-base text-pink-500">{props.tag}</span>
      </h2>
      <ul>
        {props.posts.map((post) => (
          <li key={post.slug} className="mb-6">
            <Link
              href={`/${post.year}/${post.month}/${post.slug}`}
              className="font-semibold text-gray-200"
            >
              {post.title}
            </Link>
            <div className="text-xs text-gray-400">{formatDate(post.date)}</div>
          </li>
        ))}
      </ul>
      <p className="mt-16 text-center">
        <HomeLink />
      </p>
    </>
  );
}

Page.getLayout = (page: React.ReactElement) => (
  <Layout title={page.props.tag}>{page}</Layout>
);
