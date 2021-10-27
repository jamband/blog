---
title: Bootstrap 5 をカスタマイズして使う
date: "2021-05-03"
tags:
    - css
---

## はじめに

そろそろ Bootstrap 5 の安定版のリリースが来そうなので (2021.05.02 現在)、webpack 5 と組み合わせて、良い感じに最適化をしつつ、カスタマイズしていく方法を書いていく。

## 環境

- Bootstrap 5 Beta 3
- Node.js 12.22.x
- Yarn 1.22.x
- webpack 5.36.x

## ディレクトリ構成

この記事では webpack を使っているので以下のようなディレクトリ構成になっているが、注目すべき箇所は src/styles のみで、他はほぼほぼ無視していい。

```
├── dist
├── node_modules
├── package.json
├── src
│   ├── entries
│   │   └── app.js
│   ├── icons
│   │   ├── github.html
│   │   └── grip-horizontal.html
│   ├── layouts
│   │   ├── footer.html
│   │   ├── head.html
│   │   └── header.html
│   ├── pages
│   │   ├── 404.html
│   │   ├── about.html
│   │   └── index.html
│   └── styles
│       ├── _bootstrap.scss
│       ├── _utilities.scss
│       ├── _variables.scss
│       └── app.scss
├── webpack.common.js
├── webpack.dev.js
├── webpack.prod.js
└── ...
```

## 準備

webpack といくつかのプラグインを Yarn でインストールする。GitHub に [デモリポジトリ](https://github.com/jamband/sunraz) を用意しているので、package.json の中身等を参考にしてほしい。

次に Bootstrap 5 をインストールする:

```
yarn add bootstrap@next
```

安定版がリリースされたら @next は必要なくなるので注意。

## スタイルのカスタマイズ

大きく分けて 3 つファイルを用意しておく。

- _bootstrap.scss (Bootstrap に関連するファイルを import して構成していく)
- _utilities.scss (独自のカスタムな Utilities はここに書く)
- _variables.scss (独自のカスタムな変数はここに書く)

## _bootstrap.scss

[bootstrap.scss](https://github.com/twbs/bootstrap/blob/main/scss/bootstrap.scss) をコピペして、パスを修正する。webpack (sass-loader) を使用している場合、3 つのパスの指定方法がある。

- @import "~bootstrap/scss/...";
- @import "bootstrap/scss/...";
- @import "../../node_modules/bootstrap/scss/...";

上記の指定方法は基本的にすべて動作するが、最初に相対パスとしてファイルを探しつつ、なければ node_modules 内を探していくという感じなので、相対パスで書く方法が一番コンパイル時間が短くなる。

ちなみに [@import "~bootstrap/..."; という書き方は sass-loader 11.x 以降非推奨](https://github.com/webpack-contrib/sass-loader/releases/tag/v11.0.0) になった。

デモリポジトリの _bootstrap.scss:

```scss[data-file="src/styles/_bootstrap.scss"]
// Configuration
@import "../../node_modules/bootstrap/scss/functions";
@import "./variables"; // Custom variables
@import "../../node_modules/bootstrap/scss/variables";
@import "../../node_modules/bootstrap/scss/mixins";
@import "../../node_modules/bootstrap/scss/utilities";
@import "./utilities"; // Custom utilities

// Layout & components
@import "../../node_modules/bootstrap/scss/root";
@import "../../node_modules/bootstrap/scss/reboot";
@import "../../node_modules/bootstrap/scss/type";
// @import "../../node_modules/bootstrap/scss/images";
@import "../../node_modules/bootstrap/scss/containers";
@import "../../node_modules/bootstrap/scss/grid";
// @import "../../node_modules/bootstrap/scss/tables";
// @import "../../node_modules/bootstrap/scss/forms";
// @import "../../node_modules/bootstrap/scss/buttons";
@import "../../node_modules/bootstrap/scss/transitions";
// @import "../../node_modules/bootstrap/scss/dropdown";
// @import "../../node_modules/bootstrap/scss/button-group";
@import "../../node_modules/bootstrap/scss/nav";
@import "../../node_modules/bootstrap/scss/navbar";
// @import "../../node_modules/bootstrap/scss/card";
// @import "../../node_modules/bootstrap/scss/accordion";
// @import "../../node_modules/bootstrap/scss/breadcrumb";
// @import "../../node_modules/bootstrap/scss/pagination";
// @import "../../node_modules/bootstrap/scss/badge";
// @import "../../node_modules/bootstrap/scss/alert";
// @import "../../node_modules/bootstrap/scss/progress";
// @import "../../node_modules/bootstrap/scss/list-group";
// @import "../../node_modules/bootstrap/scss/close";
// @import "../../node_modules/bootstrap/scss/toasts";
// @import "../../node_modules/bootstrap/scss/modal";
// @import "../../node_modules/bootstrap/scss/tooltip";
// @import "../../node_modules/bootstrap/scss/popover";
// @import "../../node_modules/bootstrap/scss/carousel";
// @import "../../node_modules/bootstrap/scss/spinners";
// @import "../../node_modules/bootstrap/scss/offcanvas";

// Helpers
// @import "../../node_modules/bootstrap/scss/helpers/clearfix";
// @import "../../node_modules/bootstrap/scss/helpers/colored-links";
// @import "../../node_modules/bootstrap/scss/helpers/ratio";
@import "../../node_modules/bootstrap/scss/helpers/position";
// @import "../../node_modules/bootstrap/scss/helpers/visually-hidden";
// @import "../../node_modules/bootstrap/scss/helpers/stretched-link";
// @import "../../node_modules/bootstrap/scss/helpers/text-truncation";

// Utilities
@import "../../node_modules/bootstrap/scss/utilities/api";
```
独自のカスタム変数と Utilities は上記の箇所に差し込む。また、使わないものはコメントアウトしておくことで、よりコンパイル時間が短くなり、ファイルサイズの削減にもなる。

## _utilities.scss

Bootstrap も 5 系から Utilities の追加、修正、削除などをできるようになった。それらを _utilities.scss に書く。詳しくは [Utility API](https://getbootstrap.com/docs/5.0/utilities/api/) 。

個人的にはあまり触りたくない箇所ではある。というのも、独自の Utility を追加したりすると、エディターでの補完が効かなかったり、デフォルトのスタイルとの違いが出てきて自分以外の人を混乱させる恐れがある。ここでの魔改造をやるならば Bootstrap 5 は捨てて TailwindCSS などを使ったほうが賢明だろう。やるにしても最小限に抑えておきたい。

## _variables.scss

独自変数はこのファイルに書く。[bootstrap/_variables.scss](https://github.com/twbs/bootstrap/blob/main/scss/_variables.scss) を参考にして、プロジェクトに合った色付けをしていく。実際、変数があり過ぎてめんどくさいのだが、着せ替えのできる唯一の場所でもあるので楽しんでやっていきたい。

## 本番環境に向けて

HTML を構成しているファイル内で使用していないスタイル等がある場合に、本番環境ではそれらを削除する [PurgeCSS](https://purgecss.com/) というツールがあるので導入しておく。

フレームワーク等によってインストールするパッケージや設定方法が変わるのだが、デモリポジトリでは以下のような設定になっている:

```js[data-file="postcss.config.js"]
const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = (context) => ({
  plugins: [
    require("autoprefixer"),
    context.env === "production" &&
      purgecss({
        content: [
          // "./node_modules/bootstrap/js/dist/alert.js",
          // "./node_modules/bootstrap/js/dist/button.js",
          // "./node_modules/bootstrap/js/dist/carousel.js",
          "./node_modules/bootstrap/js/dist/collapse.js",
          // "./node_modules/bootstrap/js/dist/dropdown.js",
          // "./node_modules/bootstrap/js/dist/modal.js",
          // "./node_modules/bootstrap/js/dist/offcanvas.js",
          // "./node_modules/bootstrap/js/dist/popover.js",
          // "./node_modules/bootstrap/js/dist/scrollspy.js",
          // "./node_modules/bootstrap/js/dist/tab.js",
          // "./node_modules/bootstrap/js/dist/toast.js",
          // "./node_modules/bootstrap/js/dist/tooltip.js",
          "./src/**/*.html",
        ],
      }),
  ],
});
```

詳しくは [PurgeCSS](https://purgecss.com/) や [デモリポジトリ](https://github.com/jamband/sunraz) などを参考にしてほしい。

また簡易的なものだが、JavaScript 部分でも以下のように (webpack の場合)、使用するものだけ import することで、アセット周りのファイルサイズの削減にもなるのでやっておきたい:

```js[data-file="src/entries/app.js"]
// js
// require("bootstrap/js/dist/alert.js");
// require("bootstrap/js/dist/button.js");
// require("bootstrap/js/dist/carousel.js");
require("bootstrap/js/dist/collapse.js");
// require("bootstrap/js/dist/dropdown.js");
// require("bootstrap/js/dist/modal.js");
// require("bootstrap/js/dist/offcanvas.js");
// require("bootstrap/js/dist/popover.js");
// require("bootstrap/js/dist/scrollspy.js");
// require("bootstrap/js/dist/tab.js");
// require("bootstrap/js/dist/toast.js");
// require("bootstrap/js/dist/tooltip.js");

// css
require("../styles/app.scss");

// images
```

## 本番環境へのビルドとデプロイ

最近のプラットホームは、それらを使うだけでいろいろな最適化を裏で勝ってにやってくれるので本当にありがたいわけだが、今回は [Cloudflare Pages](https://pages.cloudflare.com/) を使ってみた。Cloudflare Pages 自体は基本的に JAMstack を想定している感じだが、webpack でビルドしてデプロイするただの静的サイトでも使えるし、日本からアクセスする場合にも Netlify よりレスポンスが速いし (無料枠で比較した場合)、設定等も楽だったので、わりと感触は良かった。

## まとめ

JavaScript のフレームワーク (React, Vue, Angular 等) が出てきた辺りから、それらのフレームワーク専用の UI Framework が増えて、あえて今、生の Bootstrap を使う必要性もなくなってきたわけだが、どのようなプロジェクトでも使えて、比較的剥がしやすいという意味でも [Bulma](https://bulma.io/) や [TailwindCSS](https://tailwindcss.com/)、そして [Bootstrap](https://getbootstrap.com/) などの CSS Framework を 1 つくらい覚えておいても損はないのかなぁと一周回って最近思うようになってきている。

## リンク

この記事を作成するにあたり、デモ用のリポジトリとサイトを作ったので、興味のある人は参考にしてほしい。

- [GitHub: jamband/sunraz](https://github.com/jamband/sunraz)
- [SunRaz](https://sunraz.pages.dev/)
