import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Tags } from "~/components/tags";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "~/constants/app";
import { Page } from "~/layouts/page";
import type { Post } from "~/types/post";
import { getLatestPosts, getOldPosts, getTags } from "~/utils/api";
import { formatDate } from "~/utils/format";

type Props = {
  tags: string[];
  latestPosts: Post[];
  oldPosts: Post[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      tags: getTags(),
      latestPosts: getLatestPosts(),
      oldPosts: getOldPosts(),
    },
  };
};

export default function View(props: Props) {
  const [showOldPosts, setShowOldPosts] = useState(false);
  const toggleOldPosts = () => setShowOldPosts((previous) => !previous);

  return (
    <Page title="">
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:title" content={APP_NAME} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content={APP_URL} />
      </Head>
      <h2 className="mb-5 text-4xl">Tags</h2>
      <Tags tags={props.tags} className="mb-14" />
      <h2 className="mb-5 text-4xl">
        Posts <span className="text-base text-pink-500">all</span>
      </h2>
      <ul>
        {props.latestPosts.map((post) => (
          <li key={post.slug} className="mb-6">
            <Link href={`/${post.year}/${post.month}/${post.slug}`}>
              <a className="font-semibold text-gray-200">{post.title}</a>
            </Link>
            <div className="text-xs text-gray-400">{formatDate(post.date)}</div>
          </li>
        ))}
      </ul>
      {!showOldPosts && (
        <div className="text-center">
          <button
            onClick={toggleOldPosts}
            className="rounded bg-gray-700 px-3 py-2 text-gray-200 shadow-sm active:text-pink-500"
          >
            more old posts ↓
          </button>
        </div>
      )}
      <ul style={{ display: !showOldPosts ? "none" : "block" }}>
        {props.oldPosts.map((post) => (
          <li key={post.slug} className="mb-6">
            <Link href={`/${post.year}/${post.month}/${post.slug}`}>
              <a className="font-semibold text-gray-200">{post.title}</a>
            </Link>
            <div className="text-xs text-gray-400">{formatDate(post.date)}</div>
          </li>
        ))}
      </ul>
      {showOldPosts && (
        <div className="text-center">
          <button
            onClick={toggleOldPosts}
            className="rounded bg-gray-700 px-3 py-2 text-gray-200 shadow-sm active:text-pink-500"
          >
            hide old posts ↑
          </button>
        </div>
      )}
    </Page>
  );
}
