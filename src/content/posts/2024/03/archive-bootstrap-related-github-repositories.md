---
title: Bootstrap 関連の GitHub リポジトリをアーカイブ化する
created_at: "2024-03-23"
last_updated: "2024-03-23"
tags: [css, info]
---

## はじめに

過去数年に渡って GitHub に [Bootstrap](https://getbootstrap.com) 関連のリポジトリを複数作成・保守してきたが、Bootstrap 自体をあまり使わなくなったので、その一部をアーカイブ化する。

## Bootstrap 関連の GitHub リポジトリ一覧

- [jamband/blissable](https://github.com/jamband/blissable) (SvelteKit + Bootstrap)
- [jamband/quietz](https://github.com/jamband/quietz) (Nuxt + Bootstrap)
- [jamband/suerte](https://github.com/jamband/suerte) (Next.js + Bootstrap + Storybook)
- [jamband/sunraz](https://github.com/jamband/sunraz) (Astro + Bootstrap)

上記の中で、アーカイブ化するのは以下:

- [jamband/blissable](https://github.com/jamband/blissable) (SvelteKit + Bootstrap)
- [jamband/quietz](https://github.com/jamband/quietz) (Nuxt + Bootstrap)

[jamband/suerte](https://github.com/jamband/suerte) は Next.js + Storybook の動くドキュメントとして残し、[jamband/sunraz](https://github.com/jamband/sunraz) は唯一の Bootstrap 関連の動くドキュメントとして残す。また、この 2 つに関しては、今後も更新・保守していく。

## アーカイブ化する理由について

元々 Bootstrap 5 がリリースされる前に、Bootstrap 4 に対応した [React Bootstrap](https://github.com/react-bootstrap/react-bootstrap) や [BootstrapVue](https://github.com/bootstrap-vue/bootstrap-vue) を使っていた。その後 Bootstrap 5 がリリースされ、Bootstrap 5 に対応した React Bootstrap や BootstrapVue がリリースされるのを待っていた。

ただ、BootstrapVue に関しては、Vue 3 のリリースとも重なり、一向に Bootstrap 5 に対応したバージョンがリリースされなかった。

少し困ったが、Bootstrap 5 は今まで依存してきた [jQuery](https://jquery.com) に依存しないバージョンであるため、React Bootstrap や BootstrapVue をあえて使わなくても問題ないのではないか？と考え、React や Vue 上で動作する Bootstrap 5 のデモサイトをいくつか作成した。

もちろん、動作はしたが、動的に Bootstrap の JavaScript モジュールを import したり、スタイルをカスタマイズするために大量の Sass ファイルを import したりで、あまり昨今のフロントエンドのフレームワークやライブラリとの相性は良くない。

そもそも Bootstrap は歴史が長く、jQuery の全盛期に登場したものであるため、昨今のフロントエンド向けに作られたものではない。

また、ここ数年の CSS の進化とともに、JavaScript を使わなくても実現できるコンポーネントも増えつつあるので、あえて Bootstrap を使う機会が減った。

あと、しっかりと最適化した上でのスタイルのカスタマイズがやややりずらく ([Sass · Bootstrap](https://getbootstrap.com/docs/5.3/customize/sass/) や [Optimize · Bootstrap](https://getbootstrap.com/docs/5.3/customize/optimize))、それならもう [Tailwind CSS](https://tailwindcss.com) や [CSS Modules](https://github.com/css-modules/css-modules) でいいのでは？と最近よくなっていた。

このような経緯から、いくつかの GitHub リポジトリをアーカイブ化することを決めた。

## まとめ

Bootstrap からは UI パーツやコンポーネントの粒度などを教わった。またデザイントークンやアクセシビリティなどを意識するきっかけにもなった。これらは現在の個人的なフロントエンド開発にも大いに活かされているはずだし、今後の開発にも活かしていきたい。

## 関連リンク

- [Bootstrap](https://getbootstrap.com)
- [React Bootstrap](https://github.com/react-bootstrap/react-bootstrap)
- [BootstrapVue](https://github.com/bootstrap-vue/bootstrap-vue)
- [Tailwind CSS](https://tailwindcss.com)
- [CSS Modules](https://github.com/css-modules/css-modules)
