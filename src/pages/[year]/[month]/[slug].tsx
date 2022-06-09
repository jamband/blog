import Head from "next/head";
import { HomeLink } from "../../../components/home-link";
import { PostContent } from "../../../components/post-content";
import { PostHeader } from "../../../components/post-header";
import { APP_NAME, APP_URL } from "../../../constants/app";
import { Layout } from "../../../layouts/layout";
import type { Post } from "../../../types/post";
import { getPostByPath, getPosts } from "../../../utils/api";
import { markdownToHtml } from "../../../utils/convert";
import { description } from "../../../utils/meta";

type Props = {
  post: Post;
};

type Params = {
  params: {
    year: string;
    month: string;
    slug: string;
  };
};

export const getStaticProps = async ({ params }: Params) => {
  const path = `${params.year}/${params.month}/${params.slug}.md`;
  const post = getPostByPath(path);
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post.data,
        content,
        description: description(content),
      },
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: getPosts().map((post) => ({
      params: {
        year: post.year,
        month: post.month,
        slug: post.slug,
      },
    })),
    fallback: false,
  };
};

export default function Page(props: Props) {
  return (
    <>
      <Head>
        <meta name="description" content={props.post.description} />
        <meta
          property="og:title"
          content={`${props.post.title} ･ ${APP_NAME}`}
        />
        <meta property="og:description" content={props.post.description} />
        <meta
          property="og:url"
          content={`${APP_URL}${props.post.year}/${props.post.month}/${props.post.slug}/`}
        />
      </Head>
      <article>
        <PostHeader title={props.post.title} date={props.post.date} />
        <PostContent content={props.post.content} />
        <p className="mt-16 text-center">
          <HomeLink />
        </p>
      </article>
    </>
  );
}

Page.getLayout = (page: React.ReactElement) => (
  <Layout title={page.props.post.title}>{page}</Layout>
);
