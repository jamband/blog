import type { GetStaticProps } from "next";
import Head from "next/head";
import type { ParsedUrlQuery } from "querystring";
import { NavigationLink } from "~/components/navigation-link";
import { PostContent } from "~/components/post-content";
import { PostHeader } from "~/components/post-header";
import { APP_REPOSITORY_URL } from "~/constants/app";
import { Layout } from "~/layouts/layout";
import type { PageComponent } from "~/pages/_app";
import type { Post } from "~/types/post";
import { getPostByPath, getPosts } from "~/utils/api";
import markdownToHtml from "~/utils/markdown-to-html";
import { description } from "~/utils/meta";

type Props = {
  post: Post;
  description: string;
  htmlContent: string;
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

  const { data: post, content } = getPostByPath(`${year}/${month}/${slug}.md`);
  const htmlContent = await markdownToHtml(content);

  return {
    props: {
      post,
      htmlContent,
      description: description(htmlContent),
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
        <meta name="description" content={props.description} />
        <meta property="og:description" content={props.description} />
      </Head>
      <article className="mb-16">
        <PostHeader
          title={props.post.title}
          created_at={props.post.created_at}
          last_updated={props.post.last_updated}
          historyUrl={`${APP_REPOSITORY_URL}/commits/main/src/posts/${props.post.year}/${props.post.month}/${props.post.slug}.md`}
        />
        <PostContent htmlContent={props.htmlContent} />
      </article>
      <NavigationLink href="/" className="flex justify-center">
        ← home
      </NavigationLink>
    </>
  );
};

Page.getLayout = (page) => (
  <Layout title={page.props.post.title}>{page}</Layout>
);

export default Page;
