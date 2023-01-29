---
title: Deployer の 7.0 RC 版を使ってみる
created_at: "2021-11-28"
last_updated: "2023-01-29"
tags: [deployment, php]
---

## はじめに

PHP のバージョン 8.1 が 25 Nov 2021 にリリースされ、7.3 系のセキュリティーサポートも 6 Dec 2021 で終了する。それに従って、自分が管理している PHP のパッケージなども最低バージョンを 7.4 にし 8.1 もサポートした。

また、自分は各言語の最新バージョンの 1 つ前のバージョンをローカルに持っておくという基本ルールがあって (例外もあるが)、Node.js の場合は LTS バージョンで区切って現時点では 14.x 系、PHP はマイナーバージョンで区切って 8.0 系になった。

ここで一つ問題が出てきて、PHP のデプロイツールである Deployer の現時点の最新バージョン 6.8 系が PHP の 8.x 系をサポートしていないことが判明。Deployer はローカルの Composer global で管理していて、ローカルの PHP のバージョンに依存しているので、さてどうしようかとなった。

Deployer は現在開発中の 7.0 系があって、そのバージョンは PHP 8.1 までサポートしている感じだったので、現時点ではまだ RC 版ではあるのだが、個人サイトで実験的に試すなら問題ないでしょ、ということで、よし使ってみようということになった。

## 環境

- PHP 8.0
- Deloyer 7.0 RC

## Deployer 6.x と 7.x の違い

Deployer の 6.x 系と 7.x 系の PHP のサポートバージョンの違いは上記に書いてあるとおり。あとは [Upgrade from 6.x to 7.x | Deployer](https://deployer.org/docs/7.x/UPGRADE) を見ながら対応していく。

公式ドキュメントを見る限り 7.x 系のドキュメントはまだまだ少なく、RC 版であることから、現時点で 6.x 系から 7.x 系への移行はまだおすすめできない。

そんな状況ではあるのだが、7.x 系の特徴としては以下。

- デプロイ用のスクリプトを YAML でも記述できるようになった
- Deployer 専用の GitHub Action を使って git push 時にデプロイできるようになった
- PHP のフレームワーク関連ではない recipe もコアに contrib という名前で入った

その他にもいろいろあると思うが、確認しきれていない。

## デプロイの準備

では、実際に [PlusArchive](https://plusarchive.com/) という個人サイトを例にデプロイしてみる。まずは準備をする。

構成的には以下。

- [api.plusarchive.com](https://github.com/jamband/api.plusarchive.com) というバックエンドのプロジェクトが GitHub の public レポジトリとしてある
- [plusarchive.com](https://github.com/jamband/plusarchive.com) というフロントエンドのプロジェクトが GitHub の public レポジトリとしてある
- [PlusArchive](https://plusarchive.com/) はさくらの VPS で管理している
- ssh で PlusArchive サーバと通信できるようになっている
- Deployer は各プロジェクト毎に Composer でローカルにインストールして管理する
- GitHub Action による自動デプロイはしない
- デプロイ用スクリプトは PHP で記述する

注意点としては、基本的に上記の 2 つのプロジェクトとは別に任意の場所にディレクトリを切って、そこでデプロイ作業を行う (リポジトリとは切り離して管理する)。

api.plusarchive.com のデプロイの準備 (Deployer 7.x 系はまだ RC 版なので決め打ち):

```sh
cd /path/to/plusarchive.com/deploy/api.plusarchive.com
composer require --dev "deployer/deployer:7.0.0-rc3"
touch deploy.php
```

api.plusarchive.com のデプロイ用スクリプトは以下 (xxx や 123 は伏字):

```php title="deploy.php"
declare(strict_types=1);

namespace Deployer;

require 'recipe/composer.php';

set('repository', 'https://github.com/jamband/api.plusarchive.com.git');
set('keep_releases', 3);
set('shared_dirs', ['runtime']);
set('writable_dirs', ['runtime']);
set('clear_paths', ['xxx', 'xxx']);

host('plusarchive.com')
    ->set('remote_user', 'xxx')
    ->set('port', 123)
    ->set('labels', ['stage' => 'prod'])
    ->set('branch', 'main')
    ->set('deploy_path', '/xxx/xxx');
```

api.plusarchive.com は PHP の Yii Framework 2 で書かれているため shared_dirs や writable_dirs で runtime を指定する。実際はデータベースのマイグレーションコマンドなども実行する必要があるのだが、このプロジェクトでは使っていないので書いてない。

また Deployer は各フレームワークなどを想定して、それ専用の [recipe](https://deployer.org/docs/7.x/recipe/common) を持っているので、使えそうであれば使ってもいいわけだが、プロジェクトによっていろいろ細かな構成の違いなどがあったりするので、実際問題わりと使いづらい。ただ参考にはできるのでコードの詳細を見ながら 7.x の雰囲気を味わっておく。

plusarchive.com のデプロイの準備:

```sh
cd /path/to/plusarchive.com/deploy/plusarchive.com
composer require --dev "deployer/deployer:7.0.0-rc3"
touch deploy.php
```

plusarchive.com のデプロイ用スクリプトは以下 (xxx や 123 は伏字):

```php title="deploy.php"
declare(strict_types=1);

namespace Deployer;

require 'recipe/common.php';
require 'contrib/yarn.php';

set('repository', 'https://github.com/jamband/plusarchive.com.git');
set('keep_releases', 3);
set('clear_paths', ['xxx', 'xxx']);

host('plusarchive.com')
    ->set('remote_user', 'xxx')
    ->set('port', 123)
    ->set('labels', ['stage' => 'prod'])
    ->set('branch', 'main')
    ->set('deploy_path', '/xxx/xxx');

after('deploy:update_code', 'yarn:install');


task('yarn:build', function () {
    run('cd {{release_path}} && yarn build');
});

task('pm2:start', function () {
    run('cd {{deploy_path}} && pm2 startOrRestart ecosystem.config.js');
});

task('deploy', [
    'deploy:prepare',
    'yarn:build',
    'pm2:start',
    'deploy:publish',
]);
```

plusarchive.com は Yarn + Nuxt + PM2 の構成なので上記のような感じになっている。

## デプロイする

api.plusarchive.com のデプロイ用コマンドの作成:

```json title="/path/to/plusarchive.com/deploy/api.plusarchive.com/composer.json"
{
  "require": {
    "php": "^8.0"
  },
  "require-dev": {
    "deployer/deployer": "7.0.0-rc3"
  },
  "scripts": {
    "prepare": "@composer install --quiet",
    "deploy": "dep deploy stage=prod",
    "releases": "dep releases",
    "unlock": "dep deploy:unlock",
    "clean": "rm -rf vendor"
  }
}
```

plusarchive.com のデプロイ用コマンドの作成 (上記と全く同じ):

```json title="/path/to/plusarchive.com/deploy/plusarchive.com/composer.json"
{
  "require": {
    "php": "^8.0"
  },
  "require-dev": {
    "deployer/deployer": "7.0.0-rc3"
  },
  "scripts": {
    "prepare": "@composer install --quiet",
    "deploy": "dep deploy stage=prod",
    "releases": "dep releases",
    "unlock": "dep deploy:unlock",
    "clean": "rm -rf vendor"
  }
}
```

デプロイは Composer のコマンドを経由して行う。流れ的には以下。

```
cd /path/to/plusarchive.com/deploy/api.plusarchive.com
composer run prepare
composer run deploy
composer run clean

cd /path/to/plusarchive.com/deploy/plusarchive.com
composer run prepare
composer run deploy
composer run clean
```

何かしらの問題があり途中で止まった場合 lock されるので unlock コマンドを用意しておき、デプロイされたプロジェクトの履歴を見るために releases も用意しておく。

## まとめ

わりと雑で少しめんどくさいデプロイ方法ではあるが、問題なく動いてはいるのでとりあえず良しとする。

今回のデプロイ方法はただの一例であって、このような方法ではなく、もっと洗練された方法があると思うので、Deployer の 7.x の安定版のリリースを待ちつつ、少しずつ改善していきたい。

## 関連リンク

- [Deployer](https://deployer.org/)
