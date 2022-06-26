---
title: SvelteKit を使って jamband/tapes を作った
created_at: "2021-10-16"
last_updated: "2021-10-16"
tags:
    - github
    - svelte
    - sveltekit
---

## はじめに

[jamband/tapes](https://jamband.github.io/tapes/) をリリースした。この記事では jamband/tapes の技術的なことについて書いていく。

## 環境

- Host: GitHub Pages
- Framework: SvelteKit Beta
- CSS: TailwindCSS

## jamband/tapes とは何か

GitHub Pages 上で動作する SvelteKit を使った Jamstack 構成の音楽サイト。

自分は趣味で [PlusArchive](https://plusarchive.com) というサイトを持っていて、トップページに表示される Recent favorite tracks というものがある。これはだいたい月 1 で更新しているものだが、過去のものはアーカイブとして残らないので、ちょっともったいないなぁと思い、そのアーカイブを「テープ」と名付けた jamband/tapes を作った。

jamband というのは自分の GitHub のアカウント名であり、このブログも GitHub Pages 上で動作していて名前が jamband/blog なので、それに合わせた名前になる。


## 更新頻度とコンテンツの量について

Jamstack 構成で気になるのはまず更新頻度とコンテンツの量。更新頻度については基本月 1 なので問題はなく、月 1 で 1 つのテープが作られ、おおよそ 6 つ程度のそのテープに関連するトラックが追加される。

テープとトラックはそれぞれユニークなページを持っているので、コンテンツの量としては月 7 ページずつ増加する。1 年だと 84 ページになり、10 年だと 840 ページになる。20 年だと 1680 ページになる。

## 採用したフレームワークについて

安定の Next.js さんでもいいわけだが (Incremental Static Regeneration もあるし)、最近自分は SvelteKit をよく触っていたので、それを採用した。また、データについては外部 CMS を使わず JSON 形式のファイルを同レポジトリに持つ構成になっている。

懸念点としては Node.js によるファイル操作でデータを引っ張ってくるので、例えばコンテンツが増えてページネーションを実装したいなぁってときに自分でいろいろ書かなくちゃいけなかったり、コンテンツの量がどのくらい増えたらファイル操作のパフォーマンスに影響するのかを深くは把握していないので、若干の不安はあるが、ファイル操作自体は読み込みのみだけだし、コンテンツの量も急に想定外に増加することはないので、見せ方をちょっと工夫すればなんとかなるだろうと思っている。

## JSON 形式によるデータ (テープ) の生成について

JSON 形式によるテープのデータは PlusArchive の [バックエンドのコマンド](https://github.com/jamband/api.plusarchive.com/blob/main/commands/TapeController.php) で自動生成する。生成された JSON 形式のファイルを jamband/tapes の特定のディレクトリに置き、若干の目視を加えながら修正をする (言語によっては slug の生成が完璧ではないため) 。

結果として半自動になるわけだが、そこは潔く諦めつつ、少しずつ改善していく。

## 現状の SvelteKit について

SvelteKit は 2021 年 10 月現在まだ Beta であり、安定版に向けて着実に進んではいるものの、やはりまだ安定はしていない。わりと致命的なバグがあったり、アップデートしたら壊れたってこともたまにある。もちろん Beta なので Breaking Change も発生するし、[Vite](https://vitejs.dev/) 関連の問題も多そうで大変そうではあるが、「使える箇所で使ってみつつ様子を見る」程度には使えるのでガンガン使っていきたい。

問題や変更箇所は [Issues](https://github.com/sveltejs/kit/issues) であったり、[各パッケージの ChangeLog](https://github.com/sveltejs/kit#packages) であったりで確認できる。

## テストについて

Svelte/SvelteKit のコンポーネントのテストは [Jest](https://jestjs.io/) + [svelte-jester](https://github.com/mihar-22/svelte-jester) + [Svelte Testing Library](https://github.com/testing-library/svelte-testing-library) の組み合わせで書くのが良いと思われるが、現状まだ slot のテストができないみたいで ([ハックすればできなくもない](https://github.com/testing-library/svelte-testing-library/issues/48#issuecomment-707338500)) 、絶望して書くのをやめた。ここはもう少し様子を見ようと思う。

## まとめ

この記事ではコードを 1 つも書いてないが、以下の関連リンクで jamband/tapes のコードを確認できるので、気になる人はどうぞ (fetch 部分にバグがあって変なハックをしていたりするがそのうち修正されると思われる) 。

## 関連リンク

- [SvelteKit](https://kit.svelte.dev/)
- [jamband/tapes](https://jamband.github.io/tapes/)
- [GitHub: jamband/tapes](https://github.com/jamband/tapes/)
