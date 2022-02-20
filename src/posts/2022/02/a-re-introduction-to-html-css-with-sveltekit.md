---
title: SvelteKit を使った HTML/CSS 再入門
date: "2022-02-20"
tags:
    - css
    - html
    - sveltekit
---

## はじめに

IE 11 がそろそろ終わるので、IE 11 以降で利用できる HTML/CSS 関連の機能を再確認したくて簡単な Web サイトを作った。基本的には HTML/CSS ファイルのみを読み込むだけのごく小規模な静的サイトなのだが、それをなぜ SvelteKit で作ったのか、などを細かく説明していく。

## 環境

- VSCode
- SvelteKit Beta
- Hosting: GitHub Pages

## 今回作った Web サイト

- [jamband/denene](https://jamband.github.io/denene/)
- [GitHub jamband/denene](https://github.com/jamband/denene)

この jamband/denene ではいくつかの縛りを自分に課している。具体的には以下:

- UI Framework は使わない
- CSS Framework は使わない
- ポインティングデバイスでのみ機能するものは極力使わない
- JavaScript は可能な限り使わない

要はミニマムな構成でいかに統一感のある Web サイトを作るかを課題にしている。自分は Web におけるアクセシビリティやセマンティクス、またデザインのセンスや知識が足りないので、今後使われていくであろう新しい HTML/CSS の機能を触りながら、それらの向上も目的にしている。

## 静的サイトを作るときに SvelteKit を使う利点

静的サイトを作る道具はいくらでもあるわけだが、なぜ SvelteKit を使ったかは以下:

- パッケージのインストールが速い
- 開発環境を立ち上げ Web ブラウザに反映されるまでの時間が短い
- コードを更新して Web ブラウザに反映されるまでの時間が短い
- Svelte の構文自体がシンプルで初学者でも比較的わかりやすい
- レイアウトや部品などをコンポーネントとして分けて管理できる
- ファイルシステムベースなルーティングを持っている
- Svelte Language Tools が優秀 (アクセシビリティや未使用の CSS セレクターなどを警告してくれたり、いろいろと便利)
- スタイルはそのコンポーネントにスコープされるので管理が楽
- フレームワークのランタイムを本番環境では使わない、ということも可能
- 本番環境用のビルドが速い

といった感じで、HTML/CSS のみを扱う静的な Web サイトでも十分に書きやすく管理しやすい機能を備えている。

逆に欠点は、SvelteKit 自体がまだ Beta であること。これはかなり致命的だがそのうち解消される。また周辺ライブラリも React や Vue に比べるとまだまだ少ない。

## SvelteKit で JS のない Web サイトの作り方

SvelteKit はデフォルトではまず基本的な HTML をサーバでレンダリングし、ハイドレーション処理を行なったあと、それ以降はクライアントでルーティングをしつつ DOM をインタラクティブに更新していく、みたいなことをやっている。このような処理の流れは他でもよく使われていて、初回レンダリングの速度を出しつつ SEO 対策もでき、その後の動作は軽量で... みたいな感じなのだが、今回作った Web サイトではそもそも「JavaScript を可能な限り使わない」という縛りがあるため、ハイドレーションしない、クライアントルーティングもしない、ということをまずやらないといけない。

どうするか。[SvelteKit はページ毎にいくつかのオプションを持っていて](https://kit.svelte.dev/docs/page-options)、そのページの特性に合わせたレンダリングというものができる。そしてさらにアプリケーション全体でもそれらの設定ができるため、結果的に本番環境ではフレームワークのランタイムを読み込ませない、ということも可能になる。

以下のようにする:

```js[data-path="/path/to/project/svelte.config.js"]
import adapter from "@sveltejs/adapter-static";

const dev = process.env.NODE_ENV === "development";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    browser: {
      // 本番環境ではクライアントルーティングはしない
      router: dev || false,
      // 本番環境ではハイドレイト処理はしない
      hydrate: dev || false,
    },
    // 1024 バイトまでは CSS をインライン化する
    inlineStyleThreshold: 1024,
    paths: {
      base: process.env["VITE_GITHUB_ACTIONS"] ? "/denene" : "",
    },
    trailingSlash: "always",
  },
};

export default config;
```

これで結果的に本番環境ではランタイムファイルなどの読み込みもなくなり、HTML/CSS のみを読み込む静的な Web サイトを作ることができる。

## SvelteKit 以外で良い選択肢はあるか

React, Vue, Svelte などをよく使っていて慣れている場合に限って言えば、これもまた Beta なのだが [Astro](https://astro.build/) が圧倒的に良かった。

というか jamband/denene を作った後に Astro を知ったのだが、まさに自分が作ろうとしているものにぴったしハマるツールで、JavaScript をできる限り使わず、コンポーネント指向で静的な Web サイトを構築できる。

特徴的なのが「部分的ハイドレーション」と呼ばれるもので、特定のコンポーネントのみをハイドレーションするといったことができ、ハイドレーションするための JavaScript のコードを最小限に抑えることができる。また、ちょっとした DOM に対してのインタラクティブなコードをインラインで書けたり、全体的にわりと良い印象を受けた。

ただ、まだ Beta ということもあって細かな部分で不満があったので、早速 SvelteKit から置き換えようかなとはならなかった。

その他では [11ty](https://www.11ty.dev/) が気になって触ってみたが、Hugo や Jekyll みたいな感じで、決して悪くはないのだが、Astro みたいな感動はなかった。ただ 11ty は触った人の評価はかなり高いらしいので、別の機会にまた深く触ってみたいなぁとは思っている。

## まとめ

例えばこのブログのような Web サイトは、検索エンジンもしくはどこかのリンクを辿ってアクセスされる。そして読まれた後はよっぽどの興味がないかぎり即閉じられる。要は初回のレンダリング速度が最重要で、その後はサクサク動作しようが大袈裟に言えばおまけみたいなところがある。

もちろんフレームワーク側がそれらを意識して最適化してくれるとはいえ、このような特徴のある Web サイトを考えると「あれ？SPA じゃなくてよくない？」となり、最終的には「あれ？ランタイムいらなくない？」となる。

いくつかの状態を持った Web サイトではそうはいかないかもしれないが、特定の Web サイトに絞っていえばハイドレーションもクライアントルーティングも必要なく、結果 JavaScript ファイルの読み込みを大幅に削減でき、初回のレンダリング速度において大きなアドバンテージを得ることができる。

今回は SvelteKit を使ってそれらを試した。その他では試してはいないが [Next.js でも実験的ではあるが同じようなことができる](https://github.com/vercel/next.js/pull/11949)し、Nuxt.js でも [injectScripts](https://nuxtjs.org/docs/configuration-glossary/configuration-render/#injectscripts) というオプションで同じようなことができる。ただ、ある意味でフレームワークの特徴を潰す極端な設定ではあるので、扱いには注意しないといけない。

そして、フロントエンドの開発者に絞れば、[Astro](https://astro.build/) がそれらのニーズに応えてくれる最良のツールになるんじゃないかなぁと期待している。

## 関連リンク

- [SvelteKit](https://kit.svelte.dev/)
- [Astro](https://astro.build/)
- [11ty](https://www.11ty.dev/)
- [jamband/denene](https://jamband.github.io/denene/)
- [GitHub jamband/denene](https://github.com/jamband/denene)
