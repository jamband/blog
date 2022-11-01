---
title: PlusArchive を Yii + Nuxt から Laravel + Next.js にリプレイスした
created_at: "2022-11-01"
last_updated: "2022-11-01"
tags:
    - laravel
    - next
---

## はじめに

個人的に趣味でやっている [PlusArchive](https://plusarchive.com) という Web サイトを Yii + Nuxt から Laravel + Next.js にリプレイスしたので、そこらへんの話を書いていく。

## 環境

リプレイス前:

- サーバー: さくらの VPS CentOS 7
- Web サーバー: nginx mainline
- データベース: MySQL 8.0.x
- PHP: 8.0.x
- バックエンド Web API: Yii 2.x
- フロントエンド: Nuxt 2.x

リプレイス後:

- サーバー: さくらの VPS CentOS 7
- Web サーバー: nginx mainline
- データベース: MySQL 8.0.x
- PHP: 8.0.x
- バックエンド Web API: Laravel
- フロントエンド: Next.js

## リプレイスした理由

リプレイス前後で変更があったのはバックエンドとフロントエンドのフレームワーク、あとデータベースの構成のみで、その他はとりあえずリプレイス前の状態を維持している。

バックエンドについては、[Yii](https://www.yiiframework.com/) 2.x から現在最新バージョンの [Laravel](https://laravel.com/) にリプレイスした。理由としては Yii のバージョン 3.x の開発が進行中のまま数年が経過していて、まだすべての安定版がリリースされていないのと (リポジトリを多数に分割して管理する構成になっている)、あと個人的に Web 制作で扱うフレームワークの数を減らしたくて、これもとりあえずだが最近よく触っている Laravel にリプレイスした。将来的には [Symfony](https://symfony.com/) に落ち着きたいと思っている。

フロントエンドについては、[Nuxt](https://nuxtjs.org/) 2 から [Next.js](https://nextjs.org/) にリプレイスした。おそらく 2022 年内には Nuxt 3 の安定版がリリースされるかとは思うが、現状のフロントエンドについては満足のいく「何か」は存在しなくて、消去法的に Next.js になった。

具体的には、エディターや IDE との相性、TypeScript との相性、コードフォーマッターとの相性、周辺ライブラリの充実、あとなにより Vercel のスピードとパワー。webpack 4 から 5 への移行のスピードとスムーズさは鮮やかだったし、SWC の導入、そして [Turbopack](https://turbo.build/pack) とかいう何かすごそうなものまで出てきて、どうしても期待せざるを得ない。ただパワーがあり過ぎて最近若干怖いなという印象はある。

データベースについては PostgreSQL への移行も考えたが、ややリスクがあるのと、 MySQL 8.0.x の最新バージョンだとサブクエリ関連のパフォーマンスも上がっているみたいなので、無理して移行する意味もなく現状を維持。Laravel の Eloquent でもわりとカジュアルに whereHas (サブクエリを実行する) などを使っている。2038 年問題については、2038 年までにはさすがに解決されているだろうという楽観的な考えのもと、特にこれといった対策はしていない。

サーバーについては、趣味的な個人開発では何かと助かるさくらの VPS を維持。基本英語のサイトでサーバーが日本というわりと意味のわからない構成ではあるが、趣味で公開しているすべてのものは実験であり、個人的なドキュメントでもあるため良しとする。

OS については CentOS 7 のサポートが 2024 年 06 月 30 日までと公式に記載されているので ([About/Product - CentOS Wiki](https://wiki.centos.org/About/Product))、良いタイミングで Ubuntu 22.04 LTS に移行したい。ただ、系統が違うのともう少し安定してからでいいやとは思っている。ここはかなり大変なので慎重にやっていきたい。

## バックエンドについて

認証関連はクッキーベースのセッション認証、API へのアクセスは REST API がベースになっている。その他は特に何も特徴はない。

Laravel については一応オレオレのルールがあり、以下のような感じ:

- ファサードはデータベースのマイグレーションファイル以外は基本的には使わない
- ヘルパー関数は config ディレクトリ以外では基本的には使わない (__() 関数は例外とする)
- DI するときは基本的にはコンストラクターでインジェクション、無理ならセッターメソッドでインジェクション、それでも無理なら Container::getInstance()->make() でインジェクション、テストケースは $this->app->make() でインジェクションする
- リソースはグループに分けて、さらにアクション毎に分けて管理する
- 暗黙的な何かは基本的には使わない (グローバルスコープ、ルートモデルバインディングなど)

他にもたくさんあるが、とりあえず Laravel way を極端に外れない程度には調整が必要で、どのファイルを開いてもそこで何をしているのかできる限り理解できるような完結性のある設計にしておきたい。

## フロントエンドについて

Next.js はページごとに HTML を生成するタイミングを調整でき、事前に HTML を生成しておくものと、リクエストごとに動的に HTML を生成する 2 種類がある。これは Web サイトの各ページの特徴を考えて決める。例えば PlusArchive の一部では以下のようになっている。

事前に HTML を生成しておくページ:

- /
- /playlists
- /playlists/\[id\]

動的に HTML を生成するページ:

- /tracks
- /tracks/search
- /tracks/\[id\]

「事前に HTML を生成しておく」というのは、ビルド時に HTML を生成するわけで、例えばデータベースからデータを引っ張ってきて HTML を生成しているようなページがあった場合、関連するデータに更新があればその都度ビルドが必要になる。そのため PlusArchive では基本的には更新頻度が低いページでやっている。

また、更新頻度が低くても、ページネーションや細かな絞り込みが発生するページに関しては動的に HTML を生成するような感じにしている。理由は単純にビルド時間とビルド回数を増やしたくないから。検索ページはユーザーの入力がそのまま結果に反映されるようになっているので、現状では事前に HTML を生成するのは不可能。

管理画面については、SEO などを考慮しなくてもいいので、最低限の HTML を動的に生成し、データ表示部分はクライアントでやる。PlusArchive では [@tanstack/react-query](https://tanstack.com/query) を使っている。

API サーバーから引っ張ってきたデータは JavaScript のメモリにキャッシュされ、さらに同じリクエストが発生した場合はキャッシュされたデータを利用し「再度リクエストしない」というやり方をベースにしている。データに更新があった場合は、関連するキャッシュをキー別に上手く更新したり無効にしたりしながら整合性を持たせている。 詳しくは [ReactQueryでキャッシュを最大限利用する](https://blog.microcms.io/optimize-cache-with-react-query/) がわかりやすい。

このやり方をすると結果的に API サーバーへのアクセスを最低限にするという利点があるが、それとは別にキャッシュの管理がわりと大変で、キャッシュの無効漏れが発生し、データの整合性が失われているページを作ってしまう恐れがある。現状ではテストでそれらの挙動を担保しているが、もう少し改善が必要かなと思う。

その他では、管理画面のフォーム周りはすべて [React Hook Form](https://react-hook-form.com/) を使い、可能な限り事前にクライアント側で入力値を検証し (最終的にはサーバー側でも検証するが)、エラーがある場合はそれを即座に表示するようにしている。これも API サーバーへのアクセスを最低限にするという利点がある。また上手く使えばフォームの二重送信を防げたり、必要なときに必要なものを表示・操作させることも可能で、かなり柔軟で高機能。ただ @tanstack/react-query と同様にちゃんと使うにはそれなりのコストがかかる。

CSS のフレームワークは [Bootstrap](https://getbootstrap.com/) 5 から [Tailwind CSS](https://tailwindcss.com/) に移行した。Bootstrap はカスタマイズする前提で使うと開発時にベースファイルの読み込みが遅かったり、JavaScript を含むコンポーネントがフロントエンドの技術と相性が悪かったり、本番環境にビルドするときに一手間が必要だったり (unused な CSS を取り除く処理など) でけっこう大変だった。Tailwind CSS ではそこらへんのストレスはほぼない。ただし PlusArchive でも使っているような Dropdown なコンポーネントや、モバイル幅で使われる開閉するメニューボタンなどは自分で作る必要がある。そして、それらをちゃんと作るのはかなり難しいのだが、楽しいし学べるものも多いので良しとしている。

UI Framework などは便利だが依存度が増えるだけなのであまり使いたくはない。Tailwind CSS さえも最近ちょっと怖いなと思っている。

## デプロイについて

デプロイについてはバックエンド、フロントエンドともに [Deployer](https://deployer.org/) を使用している。デプロイスクリプトはローカルで管理し、リポジトリの更新後、手動でデプロイコマンドを実行している (... は伏字)。

バックエンド:

```json:[data-file="/path/to/project/deploy/backend/composer.json"]
{
  "require": {
    "php": "^8.0"
  },
  "require-dev": {
    "deployer/deployer": "^7.0"
  },
  "scripts": {
    "prepare": "@composer install --quiet",
    "deploy": "dep deploy stage=production",
    "releases": "dep releases",
    "unlock": "dep deploy:unlock",
    "clean": "rm -rf vendor"
  }
}
```

```php:[data-file="/path/to/project/deploy/backend/deploy.php"]
namespace Deployer;

require 'recipe/composer.php';

set('repository', 'https://github.com/jamband/api.plusarchive.com.git');
set('shared_dirs', ['storage']);
set('writable_dirs', ['bootstrap/cache', '...']);
set('clear_paths', ['...']);
set('artisan', '{{bin/php}} {{release_or_current_path}}/artisan');

host('plusarchive.com')
    // ...
    ->set('...', '...');

task('artisan:config:cache', function () {
    run('{{artisan}} config:cache');
});

task('artisan:route:cache', function () {
    run('{{artisan}} route:cache');
});

task('artisan:migrate', function () {
    run('{{artisan}} migrate --force');
});

task('deploy', [
    'deploy:prepare',
    'deploy:vendors',
    'artisan:config:cache',
    'artisan:route:cache',
    'artisan:migrate',
    'deploy:publish',
]);
```

Deployer には [Laravel 用のレシピ](https://github.com/deployphp/deployer/blob/master/recipe/laravel.php)も用意されているが、自分で管理したいので使っていない。

バックエンドのデプロイ:

```
cd /path/to/project/deploy/backend
composer run prepare
composer run deploy
```

フロントエンド:

```json:[data-file="/path/to/project/deploy/frontend/composer.json"]
{
  "require": {
    "php": "^8.0"
  },
  "require-dev": {
    "deployer/deployer": "^7.0"
  },
  "scripts": {
    "prepare": "@composer install --quiet",
    "deploy": "dep deploy stage=production",
    "releases": "dep releases",
    "unlock": "dep deploy:unlock",
    "clean": "rm -rf vendor"
  }
}
```

```php:[data-file="/path/to/project/deploy/frontend/deploy.php"]
namespace Deployer;

require 'recipe/common.php';
require 'contrib/yarn.php';

set('repository', 'https://github.com/jamband/plusarchive.com.git');
set('clear_paths', ['...']);

host('plusarchive.com')
    // ...
    ->set('...', '...');

after('deploy:update_code', 'yarn:install');

task('yarn:build', function () {
    run('cd {{release_or_current_path}} && {{bin/yarn}} build');
});

task('pm2:start', function () {
    run('cd {{deploy_path}} && pm2 startOrRestart ecosystem.config.js');
});

after('deploy:cleanup', 'pm2:start');

task('deploy', [
    'deploy:prepare',
    'yarn:build',
    'deploy:publish',
]);
```

```js:[data-file="/path/to/server/deploy-path/ecosystem.config.js"]
module.exports = {
  apps : [{
    name: "plusarchive.com",
    exec_mode : "cluster",
    instances: 0,
    cwd: "./current",
    script: "yarn",
    args: "start",
    interpreter: "/bin/bash",
    log_date_format: "YYYY-MM-DD HH:mm Z"
  }]
}

```

フロントエンドのデプロイ:

```
cd /path/to/project/deploy/frontend
composer run prepare
composer run deploy
```

バックエンド、フロントエンドともに nginx で動いているが細かな設定などはここでは省略する。フロントエンドは [pm2](https://pm2.keymetrics.io/) でプロセスを起動しているが、最近 cluster モードでの起動ではエラーが発生してしまうので一時的に folk モードにしている。上記の例では cluster モードで起動しているので注意。

以下はその関連 issue:

- [Cluster mode does not work on node v16 · Issue #5300 · Unitech/pm2](https://github.com/Unitech/pm2/issues/5300)

## まとめ

本当はフレームワーク自体のリプレイスはしたくなくて、定期的にリファクタリングなどをしてメジャーバージョンを上げていくということをしたかったのだが、諸々の事情でけっこう大変だったのでリプレイスを行った。

今後発生する直近のものとしては PHP のマイナーバージョンアップ、あと Next.js もパッチバージョンが数回リリースされた後バージョン 12 から 13 へと上げていきたい。

## 関連リンク

- [PlusArchive](https://plusarchive.com/)
- [GitHub: jamband/api.plusarchive.com](https://github.com/jamband/api.plusarchive.com)
- [GitHub: jamband/plusarchive.com](https://github.com/jamband/plusarchive.com)
