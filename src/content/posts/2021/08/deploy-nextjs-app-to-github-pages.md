---
title: Next.js で作ったブログを GitHub Pages にデプロイする
created_at: "2021-08-01"
last_updated: "2023-01-29"
tags: [deployment, github, next, ssg]
---

## はじめに

静的なウェブサイトを公開できる GitHub Pages を利用して、Next.js で作ったブログを GitHub Pages にデプロイするやり方を書いていく。

## 環境

- GitHub Pages
- GitHub Actions
- Yarn 1.22.x
- Next.js 11.0.x

## 大まかな流れ

1. Next.js でブログを作成する
2. GitHub Pages にデプロイするための調整を Next.js 側で行う
3. GitHub Actions のワークフローを作成する
4. GitHub にリポジトリを作成する
5. ローカルリポジトリを GitHub に push する
6. デプロイ用のワークフローが正常に動作していることを確認する
7. ブログサイトにアクセスして正常にデプロイされているか確認する

## Next.js でブログを作成する

自分は Next.js 公式の [examples/blog-starter-typescript](https://github.com/vercel/next.js/tree/canary/examples/blog-starter-typescript) を参考にして作った。記事を Markdown で管理し、リポジトリに含めるやり方。メリットはすべてのものがリポジトリ内で完結している点。デメリットは記事の細かな操作を自分で一から書かないといけない点。もちろんいくつかのライブラリを使って楽はできるが、JavaScript や Node.js に慣れていないとわりとめんどくさい。

機能的に最小限で記事数も少ないのであれば「すべてをリポジトリに含めるやり方」がいいかもしれない。記事数が多く、機能もそこそこ充実させたい場合は Headless CMS を検討する。

Next.js の ISR (Incremental Static Regeneration) や WordPress の利用などまで考えてしまうと話がややこしくなるので、ここでは省略する。

## GitHub Pages にデプロイするための調整を Next.js 側で行う

GitHub Pages はデフォルトでは [Jekyll](https://jekyllrb.com/) を使ってサイトを構築しようとする (*Aug 01, 2021* 現在)。今回は Jekyll ではなく Next.js を使うので、もろもろの調整が必要になる。

まず、空の .nojekyll というファイルを public ディレクトリ以下に置いておく。これで GitHub Pages のデフォルトの動作を変更することができる。

```
cd /path/to/project
touch public/.nojekyll
```

次に next.config.js で以下の設定を行う。

```js title="next.config.js"
// repository_name はそれぞれの値に置き換える
module.exports = {
  basePath: process.env.GITHUB_ACTIONS && "/repository_name",
  trailingSlash: true,
};
```

[basePath](https://nextjs.org/docs/api-reference/next.config.js/basepath) は Next.js 9.5 で追加されたものだが、上記のように設定することによって、ローカル環境と GitHub Actions で実行されたビルドとで basePath の値を調整することができる。例えば [next/link](https://nextjs.org/docs/api-reference/next/link) の href が /about なリンクがページのどこかにあった場合、値は以下のようになる。


```
ローカル環境
http://localhost:3000/about/

GitHub Pages
https://username.github.io/repository_name/about/
```

ちなみに GITHUB_ACTIONS というのは GitHub Actions が持っているデフォルトの環境変数の一つ。一覧は [デフォルトの環境変数](https://docs.github.com/ja/actions/reference/environment-variables#default-environment-variables) で確認できる。ローカル環境と GitHub Actions で実行されたものを区別できるものなら特になんでもいいが、一番わかりやすそうな GITHUB_ACTIONS を今回は利用した。

[trailingSlash](https://nextjs.org/docs/api-reference/next.config.js/trailing-slash) も Next.js 9.5 で追加されたものだが、本番環境用にビルド・デプロイしたアプリケーション (Node.js サーバを必要としないもの) 上で、直接 /about にアクセスした場合などに 404 になるのを防ぐことができるので true にしておく。

 ## GitHub Actions のワークフローを作成する

 ここでは GitHub Pages にアプリケーションをデプロイする処理を書いていく。これを書くことによって、git push 時に特定のワークフローを実行することができ、ビルド・デプロイを自動化できる。

 ```
 cd /path/to/project
 mkdir -p .github/workflows
 touch .github/workflows/deploy.yml
 ```

 ```yml title=".github/workflows/deploy.yml"
 name: Deploy to GitHub Pages

# main ブランチ の push 時にこのワークフローを実行する
on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # main ブランチを取得する
      - name: Checkout
        uses: actions/checkout@v3

      # Node.js のセットアップをする
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: yarn

      # パッケージをインストールする
      - name: Install dependencies
        run: yarn --frozen-lockfile

      # ビルドする
      - name: Build
        run: yarn build

      # GitHub Pages にデプロイする
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: out
```

GitHub で個人アクセストークンを作成しておく ([個人アクセストークンを使用する](https://docs.github.com/ja/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token))。

OS や actions、Node.js のバージョンは現在自分が最適だと思うものを指定する。また actions などはバージョンが上がると書き方が変わったりするので注意。以下でそれぞれ確認することができる。

- [actions/checkout](https://github.com/actions/checkout)
- [actions/setup-node](https://github.com/actions/setup-node)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)

ビルドコマンドを package.json に書く。

```json title="package.json"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build && next export",
    ...
  },
}
```

next export が実行されるとプロジェクトルートに out ディレクトリが作成され、そこにすべての本番環境用のファイルが配置される。つまり GitHub Pages 上でのルートになる。

また、ローカル環境やステージング環境でも next export して動作確認をする場合があるので、 out ディレクトリも Git の管理下から除外しておく。

```txt title=".gitignore"
/.next
/node_modules
/out
```

## GitHub にリポジトリを作成する

もろもろの作成・設定を終えたら GitHub にリポジトリを作成する。カスタムドメインを使用しない場合リポジトリ名がそのままドキュメントルートになるので注意する。以下のような感じ。

```
username と repository_name はそれぞれの値に置き換える
https://username.github.io/repository_name/
```

## ローカルリポジトリを GitHub に push する

username と repository_name はそれぞれの値に書き換える。

```
cd /path/to/project
git init
git add .
git status
git commit
git remote add origin git@github.com:username/repository_name.git
git branch -M main
git push -u origin main
```

## デプロイ用のワークフローが正常に動作していることを確認する

GitHub で作成したリポジトリページのブランチ切替ボタンをクリックして gh-pages ブランチが作られていることを確認する。gh-pages ブランチがある場合、作成した GitHub Actions のワークフローが正常に動作していることになる (この処理は [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) がやっている) 。

次に Settings > Pages とたどり、GitHub Pages の設定項目の Source の Branch を gh-pages にし Save する。

## ブログサイトにアクセスして正常にデプロイされているか確認する

以下の URL にアクセスして動作などを確認する。

```
username と repository_name はそれぞれの値に置き換える
https://username.github.io/repository_name/
```

## まとめ

このサイトは *Aug 01, 2021* 現在 Next.js + GitHub Pages の組み合わせで動いている。Next.js で作成したものを GitHub Pages にデプロイするにあたっていろいろ調べてみたが、わりとハマりどころがあってやや苦労した。

ただ、Next.js の理解も深まり、GitHub Pages の特徴、 GitHub Actions のあれこれを学べたので結果的には収穫が多かった。以下はこのサイトのリポジトリ。

- [GitHub: jamband/blog](https://github.com/jamband/blog)

## 関連リンク

- [About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Next.js](https://nextjs.org/)
