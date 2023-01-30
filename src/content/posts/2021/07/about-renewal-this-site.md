---
title: サイトをリニューアルした
created_at: "2021-07-31"
last_updated: "2023-01-29"
tags: [info, next, nuxt]
---

## はじめに

実験的に始めたこのサイトも書いていくうちにそのまま技術系のブログとして使えることがわかり、せっかくなので GitHub Pages で管理することにした。ついでに Nuxt.js (Nuxt Content) から Next.js に移行した。そこらへんの理由などをまとめておく。

## 構成

旧:

- [Netlify](https://www.netlify.com/)
- [Nuxt.js](https://nuxtjs.org/)
- [Nuxt Content](https://content.nuxtjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

新:

- [GitHub Pages](https://docs.github.com/ja/pages/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## いろいろ移行した理由

まず Netlify から GitHub Pages に移行した理由として、リポジトリの管理を GitHub でやっているので「一緒のところがいいかな」という簡単なもの。あと Netlify は無料プランだと日本からのアクセスが遅くなるので (2021/07 現在)、とくにそこまで気にはしてなかったけど、まぁかえてみるかという簡単な理由。

独自ドメインの設定などはしていないためドメインの変更が発生するが、技術系の記事はすぐに価値が薄くなるものが多いので (特に自分が扱っているものなどは) よしとした。

Nuxt.js から Next.js に移行した理由としては、自分が Next.js が好きだからという単純な理由で、旧構成では TypeScript を使ってなかったが新構成では使っているものの、この規模だと最悪使わなくてもなんとかなるし、サイトのタイプとしてはこれ以上規模がでかくなることもないので、ほんとたいした移行理由は特にない。

むしろ優秀な [Nuxt Content の fetch 部分](https://content.nuxtjs.org/fetching) を Next.js ではほぼほぼ一から書かないといけないのでわりとめんどくさかった (だがそこが楽しい) 。

また、規模的にもかなり小さいので、開発/本番環境でのビルド時間などもそこまで変わらない。強いて言えば [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) がかなり優秀で多分みんな使っていると思うが、これも規模的には最悪書かなくても全く問題ないので、ほんとたいした移行理由は特にないことになる。

あまりよくないとは思うが、多分... 移行そのものが楽しいんだと思う。

## まとめ

最近よくフロントエンドを触っていて、その中で Nuxt.js から Next.js に移行したみたいな情報もよく入ってきて、Nuxt.js 2.x は 現状 webpack 4.x を使ってるし、Vue 3.0.x がリリースされて半年以上経っているのに周辺ライブラリの 3.x 系への対応がわりと遅くて若干不安にもなるんだけど。Nuxt.js 3.x もなんだかいつリリースされるのかわからないし。

ただ、一つの懸念として「特定のフレームワークを使っていて、メジャーバージョンのアップデートを数回してやっと見えてくる問題」というものを体験しないまま、他のフレームワークに移行することの危うさなども感じていたりする。

でも、現状の自分を見ると [SvelteKit](https://kit.svelte.dev/) 楽しー [Vite](https://vitejs.dev/) 速えーって感じだし、またそのうちこのサイトも Next.js から SvelteKit に移行するかもしれない。そんくらい次から次へと忙しい相変わらずのフロントエンド界隈であった。

## 関連リンク

- [GitHub jamband/blog](https://github.com/jamband/blog)
