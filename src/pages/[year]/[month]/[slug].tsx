import type { GetStaticProps } from "next";
import Head from "next/head";
import type { ParsedUrlQuery } from "querystring";
import { HomeLink } from "~/components/home-link";
import { PostContent } from "~/components/post-content";
import { PostHeader } from "~/components/post-header";
import { APP_NAME, APP_REPOSITORY_URL, APP_URL } from "~/constants/app";
import { Layout } from "~/layouts/layout";
import type { PageComponent } from "~/pages/_app";
import type { Post } from "~/types/post";
import { getPostByPath, getPosts } from "~/utils/api";
import { markdownToHtml } from "~/utils/convert";
import { description } from "~/utils/meta";

type Props = {
  post: Post;
};

type Params = ParsedUrlQuery & {
  year: string;
  month: string;
  slug: string;
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  const year = params?.year || "";
  const month = params?.month || "";
  const slug = params?.slug || "";

  const { data, content } = getPostByPath(`${year}/${month}/${slug}.md`);

  return {
    props: {
      post: {
        ...data,
        content: await markdownToHtml(content),
        description: description(content),
      },
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: getPosts().map(({ year, month, slug }) => ({
      params: { year, month, slug },
    })),
    fallback: false,
  };
};

const Page: PageComponent<Props> = (props) => {
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
      <article className="mb-16">
        <PostHeader
          title={props.post.title}
          created_at={props.post.created_at}
          last_updated={props.post.last_updated}
          historyUrl={`${APP_REPOSITORY_URL}/commits/main/src/posts/${props.post.year}/${props.post.month}/${props.post.slug}.md`}
        />
        <PostContent content={props.post.content} />
      </article>
      <div className="flex justify-center">
        <HomeLink />
      </div>
    </>
  );
};

Page.getLayout = (page) => (
  <Layout title={page.props.post.title}>{page}</Layout>
);

export default Page;
