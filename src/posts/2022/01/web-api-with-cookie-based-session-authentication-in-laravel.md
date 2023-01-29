---
title: Laravel でクッキーベースのセッション認証を使った Web API を実装する
created_at: "2022-01-25"
last_updated: "2023-01-29"
tags: [authentication, laravel, next]
---

## はじめに

Laravel をバックエンドの Web API として利用し、クッキーベースのセッション認証を使って認証関連のさまざまなアクションを実装していく。

## 環境

- PHP 8.x
- Laravel 9.x
- Google Chrome

また、バックエンド (Laravel) とフロントエンド (Next.js) でアプリケーションが分かれているため、以下のようなオリジンを想定している。

```
- in development environment -
Backend origin: http://localhost:8000
Frontend origin: http://localhost:3000

- in production environment -
Backend origin: https://api.example.com
Frontend origin: https://www.example.com
```

## 前提知識

この記事では開発環境、本番環境ともにいわゆるクロスオリジンな通信が発生し、またクッキーベースのセッション認証を利用しているため、前提として以下の知識が必要になる。

- [同一オリジンポリシー](https://developer.mozilla.org/ja/docs/Web/Security/Same-origin_policy)
- [オリジン間リソース共有 (CORS)](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)
- [Understanding "same-site" and "same-origin"](https://web.dev/same-site-same-origin/)
- [HTTP Cookie の使用](https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies)
- [Set-Cookie](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Set-Cookie)
- [SameSite cookies](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

上記の中でも CORS はやや複雑なのだが、クロスオリジンな通信が発生するアプリケーションを扱う場合には必要不可欠なものなので、何度も読み返し、実際に検証を繰り返しつつ、覚えていくしかない。

また Cookie も同様に各 Web ブラウザによって Set-Cookie ヘッダーの属性のデフォルト値に差異があったり、特定の環境下で異なる動作をしたり、セキュリティ関連のみに収まらず最近ではプライバシー関連での問題があったりと、わりと扱いにくくなってきたものの、これもまた各 Web ブラウザの動向を追いつつ、対応状況を把握しつつ、柔軟に対応していく他ない。

## デモアプリケーション

今回の記事を書くにあたって、以下の 2 つのデモアプリケーションを作成した。

- [jamband/api.papers](https://github.com/jamband/api.papers)
- [jamband/papers-next](https://github.com/jamband/papers-next)

Papers 自体はログインして自分しか見れないメモを残すだけの簡単なアプリケーションで、api.papers は Laravel を利用したバックエンド Web API、papers-next は Next.js を使ったフロントエンド側のアプリケーションになる。認証関連のアクションでメールを送信するなどの処理が発生するので、どこかにホスティングはせず、現状ローカル環境でのみ動作確認ができる。興味のある人は実際動かしたり、コードの読んでみたりしてほしい。

では、デモは一旦置いといて、実装の詳細について見ていく。

## Laravel 側での準備

バックエンドのアプリケーションで必要になるのは以下:

- [laravel/framework](https://github.com/laravel/framework)

Laravel のバージョン 9.2 以降では CORS 関連のパッケージがビルトインされているので、特になにかしらのパッケージをインストールしなくてもよくなった。

また、最初は [Laravel Sanctum](https://github.com/laravel/sanctum) も使っていたのだが、今回の環境ではいらないと思い途中で使うのをやめた。認証関連の実装は基本的に [Laravel Breeze の api](https://github.com/laravel/breeze/tree/master/stubs/api) を参考にしている。ただ Laravel Breeze はスターターキット的なものなので Composer でインストールとかはせず、あくまで中身のコードを参考にしている程度。

## CORS の設定

開発時を想定して再度オリジンを確認する。

```
- in development environment -
Backend origin: http://localhost:8000 (with Laravel)
Frontend origin: http://localhost:3000 (with Next.js)
```

今回の場合はポート (8000 と 3000) が違うため、Web ブラウザがクロスオリジンであると判定する。これは [XMLHttpRequest](https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest) や [Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch) を介してフロントエンド側がバックエンド側と通信を行おうとした場合に Web ブラウザが自動的に判定する。

さらにこの通信時に Web ブラウザはバックエンド側に対して「Origin」という HTTP ヘッダーを含める。これも Web ブラウザが自動的に行う。なので、バックエンド側ではこの Origin の値を最初に検証し、その後で諸々の設定を行う。

まず許可する Origin を HTTP の Access-Control-Allow-Origin ヘッダーを使って明示する。

```
Access-Control-Allow-Origin: http://localhost:3000
```

Laravel の場合は以下のようになる (環境変数名はわかりやすければなんでもいい):

```shell[data-file=".env"]
FRONTEND_ORIGIN=http://localhost:3000
```

```php[data-file="config/cors.php"]
return [
    'paths' => ['*'],
    'allowed_origins' => [env('FRONTEND_ORIGIN')], // add
    // ...
];
```

本番環境では FRONTEND_ORIGIN という環境変数をどこかしらで設定する必要がある:

```
FRONTEND_ORIGIN=https://www.example.com
```

allowed_origins の値は配列になっていて複数指定できるが、これは以下のようなことをやっているわけではないので注意:

```
Access-Control-Allow-Origin: http://localhost:3000,http://localhost:3001
```

allowed_origins はあくまで許可するオリジンのリストであって、Web ブラウザから送られてくる Origin ヘッダーの値を見て、許可するオリジンリストにマッチするものがあればレスポンスとして以下のようなヘッダーを含める、ということをやっている:

```
Access-Control-Allow-Origin: http://localhost:3000

もしくは
Access-Control-Allow-Origin: http://localhost:3001
```

Access-Control-Allow-Origin ヘッダーにはオリジンの複数指定はできない。また * (アスタリスク) も指定できるが、今回のようなセッション認証の場合、クッキーを扱うことになり * (アスタリスク) を指定した場合に Web ブラウザがエラーを返すので使えない。というより * (アスタリスク) はあらゆるすべてのオリジンからのアクセスを許可する値なので基本的には使ってはいけない (null も同様)。

次は Access-Control-Allow-Methods ヘッダーの値を明示する。

```
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS,PATCH
```

これはフロントエンド側がバックエンド側にアクセスする際に使う HTTP のリクエストメソッドを指定する。これはカンマ区切りで複数指定できる。Access-Control-Allow-Origin ヘッダーと同様に値として * (アスタリスク) を指定できるが、条件によっては意味のない * というメソッドとして扱われたりするので、必ず HTTP のリクエストメソッドを明示すること。

Laravel の場合は以下:

```php[data-file="config/cors.php"]
return [
    'paths' => ['*'],
    'allowed_origins' => [env('FRONTEND_ORIGIN')],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // add
    // ...
];
```

allowed_methods では配列で指定することになる。注意としては allowed_methods で POST を許可した場合、フロントエンド側は PUT 及び DELETE も許可されることになる。これは動作としてはややこしいが Laravel が依存している Symfony の特定のコンポーネントがそういう動作をするので仕方ない。自分はそれでもフロントエンド側が使うすべての HTTP リクエストメソッドを明示的に指定する。その方がわかりやすいので。

また、この記事では PUT, DELETE, PATCH などの HTTP リクエストメソッドを使っているが、そもそも RESTful ではない、いわゆる外部に公開することはない特定のアプリケーションに対して閉じられた Web API を作成する場合は、PUT, DELETE, PATCH などは使わず、GET, POST のみでも全然かまわない。ただどちらかに統一はするべき。

さて、この Access-Control-Allow-Methods ヘッダーはフロントエンド側が [XMLHttpRequest](https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest) や [Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch) を介してバックエンド側にアクセスしようとした際に Web ブラウザが自動的に生成する Access-Control-Request-Method ヘッダーに対してのレスポンスヘッダーであることに注意する。そしてこの Access-Control-Allow-Methods は特定のリクエストの際に使われるものであって、すべてのリクエストに対して無条件で返されるものではない、ということをとりあえず覚えておく。

次は Access-Control-Allow-Headers ヘッダーの値を明示する。これはフロントエンド側がバックエンド側にアクセスする際に使う HTTP ヘッダー一覧を指定する。

```
Access-Control-Allow-Headers: Accept,Content-Type,X-XSRF-TOKEN
```

上記以外のヘッダーが含まれたアクセスがあった場合 Web ブラウザはエラーを返し、バックエンド側との通信はその時点で遮断される。

Laravel の場合は以下:

```php[data-file="config/cors.php"]
return [
    'paths' => ['*'],
    'allowed_origins' => [env('FRONTEND_ORIGIN')],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    'allowed_headers' => ['Accept', 'Content-Type', 'X-XSRF-TOKEN'], // add
    // ...
];
```

Accept と Content-Type ヘッダーは常に許可されているヘッダーなので明示する必要はないのだが、ヘッダーの値によっては許可されたりされなかったりするというあいまいな条件があるため、すべて明示したほうが無難。X-XSRF-TOKEN ヘッダーは CSRF 対策として使われる Laravel 特有のヘッダーでフロントエンド側からバックエンド側に [XMLHttpRequest](https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest) や [Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch) を介して POST リクエストをする際などに必要になってくる。

また、この Access-Control-Allow-Headers ヘッダーでも * (アスタリスク) を指定できるが、他のヘッダーと同様に使うことはできるが、できるかぎり使わないこと。

あと、Access-Control-Allow-Headers も Access-Control-Allow-Methods と同様に Access-Control-Request-Headers を含むリクエストの際のレスポンスヘッダーであり、特定のリクエストの際に使われるものであって、すべてのリクエストに対して無条件で返されるものではない。

次に Access-Control-Allow-Credentials ヘッダーの値を明示する。今回はクッキーベースのセッション認証を利用しているため true という値を明示する必要がある。

```
Access-Control-Allow-Credentials: true
```

Laravel の場合は以下:

```php[data-file="config/cors.php"]
return [
    'paths' => ['*'],
    'allowed_origins' => [env('FRONTEND_ORIGIN')],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    'allowed_headers' => ['Accept', 'Content-Type', 'X-XSRF-TOKEN'],
    'supports_credentials' => true, // add
    // ...
];
```

## Laravel が生成する Set-Cookie ヘッダーの確認

Laravel でクッキーベースのセッション認証を安全に行う場合、必要となるミドルウェアがいくつかある。

- [EncryptCookies](https://laravel.com/api/master/Illuminate/Cookie/Middleware/EncryptCookies.html)
- [AddQueuedCookiesToResponse](https://laravel.com/api/master/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.html)
- [StartSession](https://laravel.com/api/master/Illuminate/Session/Middleware/StartSession.html)
- [AuthenticateSession](https://laravel.com/api/master/Illuminate/Session/Middleware/AuthenticateSession.html)
- [VerifyCsrfToken](https://laravel.com/api/master/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.html)

上記の中の StartSession と VerifyCsrfToken ミドルウェアが独自の Set-Cookie ヘッダーを生成し、これがフロントエンド側でも重要なものになってくるので詳しく説明していく。

CORS の設定をした状態で、StartSession ミドルウェアが割り当てられている場合、バックエンドの Web アプリケーションがどのようなレスポンスを返すのか確認してみる。

```php[data-file="config/cors.php"]
return [
    'paths' => ['*'],
    'allowed_origins' => [env('FRONTEND_ORIGIN')],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    'allowed_headers' => ['Accept', 'Content-Type', 'X-XSRF-TOKEN'],
    'supports_credentials' => true,
    // ...
];
```

```php[data-file="app/Http/Kernel.php"]
namespace App\Http;

use App\Http\Middleware\EncryptCookies;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Session\Middleware\StartSession;
// ...

class Kernel extends HttpKernel
{
    protected $middleware = [
        HandleCors::class,
        // ...
    ];

    protected $middlewareGroups = [
        'web' => [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class, // add
            // ...
        ],
    ];
    // ...
}
```

```php[data-file="app/Providers/RouteServiceProvider.php"]
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->routes(function () {
            Route::middleware('web')
                ->namespace($this->namespace)
                ->group(base_path('routes/web.php'));
        });
    }
}
```

```php[data-file="routes/web.php"]
use Illuminate\Support\Facades\Route;

Route::get('/foo', fn() => response(['message' => 'hello']));
```

バックエンド側の Web API を起動 (in development environment):

```
php artisan serve
```

簡単なフロントエンド側のスクリプトを書く:

```html[data-file="/path/to/frontend/index.html"]
<script>
  fetch("http://localhost:8000/foo", {
    headers: {
      Accept: "application/json",
    },
    credentials: "include"
  })
    .then((res) => res.json())
    .then((content) => console.log(content));
</script>
```

フロントエンド側のアプリケーションを PHP のビルトインウェブサーバで起動 (in development environment):

```
cd /path/to/frontend
php -S localhost:3000 -t .
```

Web ブラウザで http://localhost:3000 にアクセスし、Developer Tools の Console 画面で正常にレスポンスが返ってきてるかを確認する。

ここからは Web ブラウザの Developer Tools による細かな説明になる。この記事では Google Chrome (英語版) を使って進めていく。

Developer Tools の Application タブを選択し Storage 項目の Cookies を展開して http://localhost:3000 を選択する。すると現状 http://localhost:3000 に保存してあるクッキーの一覧が表示されるので、存在する場合はすべて削除しておく (右クリックして Clear で削除できる)。その状態で Network タブに移動しブラウザをリロードする。ブラウザが読み込んだファイル一覧が表示されると思うので、その中から foo を選択する。タブがさらにいくつか表示されると思うので、その中から Headers を選択する。ここでリクエストヘッダーとレスポンスヘッダーの詳細が見れる。

まずリクエストヘッダーから見ていく。この foo はフロントエンド側の index.html ファイル内の fetch() メソッドを使いバックエンド側に GET リクエストした際に Web ブラウザが自動的に生成するリクエストヘッダー。いろいろな種類のヘッダーがあるが、その中でも注目すべきは「Origin」ヘッダー。このヘッダーは「クロスオリジンなリクエストの際は必ず Web ブラウザが自動生成する」。

続いてレスポンスヘッダー。フロントエンド側から fetch() メソッドを使ってバックエンド側にリクエストがあった場合に、バックエンド側が Web ブラウザに返すヘッダーであり、ここでもいろいろな種類のヘッダーが表示されていると思うが、その中でも注目すべきは Access-Control-* と Set-Cookie の 2 つ。Access-Control-* はバックエンド側で CORS の設定時に指定した値が表示されているはず。ただ、Access-Control-Allow-Methods と Access-Control-Allow-Headers ヘッダーは存在しない。なぜかは後で説明する。

Set-Cookie には xxx_session という名前のクッキーが存在する。これはセッション情報をやりとりするときに使われるもの。Laravel の StartSession ミドルウェアが /foo ルートに割り当てられている場合に自動的に生成される。

Set-Cookie の属性についても見ていく:

```
Set-Cookie: xxx_session=eyJpdiI...; expires=...; Max-Age=7200; path=/; httponly; samesite=lax
```

Expires 属性はクッキーの有効期限。Laravel を使っている場合は config/session.php の lifetime で調整することができる。

Max-Age 属性はクッキーの期限切れまでの秒数。Laravel を使っている場合は Session の lifetime が秒数に変換され設定される。Expires と Max-Age 属性が両方設定されている場合、Max-Age が優先される。

Domain 属性はクッキーの送信先のドメインを指定する。

```
...; Domain=example.com; ...
```

そして上記のような指定がされていた場合、サブドメイン (例えば foo.example.com, bar.example.com) にもクッキーが送信される。また、Domain 属性が省略された場合はクッキーを発行したドメインにのみクッキーが送信され、サブドメインには送信されなくなる。

Laravel を使っている場合は config/session.php の domain で設定する:

```php[data-file="config/session.php"]
return [
    // ...
    'domain' => env('SESSION_DOMAIN', null),
];
```

これは変更せず、そのままにしておく。.env にも SESSION_DOMAIN はなく、つまりデフォルトでは Domain 属性は省略される。この記事では開発環境時のバックエンド/フロントエンドともに localhost という同じホストを使っているため結果的にクッキーは送信されるようになっている。ただ本番環境ではどこかしらに Domain 属性を指定した環境変数を用意しておく必要がある。

```
SESSION_DOMAIN=example.com
```

Secure 属性は HTTPS プロトコルで通信が行われた場合にのみクッキーを送信する。なので本番環境は必ず付ける。開発環境ではやっかいなので自分は省略している。

Laravel を使っている場合は config/session.php で設定する。

```shell[data-file=".env"]
SESSION_SECURE_COOKIE=false
```

```php[data-file="config/session.php"]
return [
    // ...
    'secure' => env('SESSION_SECURE_COOKIE', true),
];
```

これで結果的に本番環境では SESSION_SECURE_COOKIE という環境変数を用意しなくても Secure 属性が付く。

また、Secure 属性については Web ブラウザによって挙動が違うみたいで、開発環境時にスキームが http:// であろうと https:// であろうと 「localhost」 というホストを使っている場合、現時点の最新の Google Chrome, Firefox では Secure 属性が付いていたとしても、本来送信されないであろうクッキーが送信されるようになっている。ただ Safari (バージョン 15.2 現在) では送信されないようになっている (こういう挙動は混乱を招く)。

このような理由から開発環境では自分は Secure 属性を付けず、上記のような設定にし、本番環境では自動で付くような感じにしている。

HttpOnly 属性は JavaScript からクッキーにアクセスさせないようにする属性。XSS 攻撃を軽減することができるので認証関連を扱うクッキーには必ず付けておく。

Laravel では config/session.php で設定する。

```php[data-file="config/session.php"]
return [
    'http_only' => true,
    // ...
];
```

デフォルトでは上記のようになっているはず。このままにしておく。

最後に SameSite 属性。Web ブラウザで A というサイトにアクセスしたとする。A サイトはレスポンスの一部としてクッキーを発行したとする。Web ブラウザは A サイトから発行されたクッキーを Web ブラウザ内に保存する。で、再度同じ Web ブラウザを使って A サイトにアクセスしたとする。その際 Web ブラウザは過去に保存した A サイトから発行されたクッキーを Cookie リクエストヘッダーを用いて「自動的に」 A サイトに送信する。

この仕組みのおかげで何か再度手続きをしなくてもログイン状態を維持できたりするわけだが、この「Web ブラウザが Cookie リクエストヘッダーを用いて自動的に送信するクッキー」というのは悪用される恐れがあるため、その送信先を「限定する」というのが SameSite 属性で指定できる。

値としては Strict, Lax, None のいずれかを用いる。

Laravel では config/session.php で設定する。

```php[data-file="config/session.php"]
return [
    // ...
    'same_site' => 'lax',
];
```

デフォルトは Lax なのでこの記事ではそのままを使う。他のフレームワークでもおそらくここ数年のアップデートでデフォルト値が Lax に設定されていると思われる。クッキーを扱う場合わりと重要な値なのでしっかり確認しておく。

また、この SameSite 属性は省略でき、その場合は Web ブラウザのデフォルト値が採用されるわけだが、各 Web ブラウザによって値が違ったりするので、できる限り明示したほうがいい。

Strict, Lax, None の値の違いについては細かな部分で検証しきれていないためここでは省略する。とりあえず MDN の [Set-Cookie](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Set-Cookie) とかを読みつつ検証する他ない。おそらくだいたいのアプリケーションは Lax で問題ないと思うが、いろんな歴史を持った、いろんなアプリケーションがあるので、その中で適切だと思う値を指定する。

続いて Laravel のもう一つのミドルウェアである [VerifyCsrfToken](https://laravel.com/api/8.x/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.html) を見ていく。

```php[data-file="app/Http/Kernel.php"]
namespace App\Http;

use App\Http\Middleware\EncryptCookies;
use App\Http\Middleware\VerifyCsrfToken; // add
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Session\Middleware\StartSession;
// ...

class Kernel extends HttpKernel
{
    protected $middleware = [
        HandleCors::class,
        // ...
    ];

    protected $middlewareGroups = [
        'web' => [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            VerifyCsrfToken::class, // add
            // ...
        ],
    ];
    // ...
}
```

Web ブラウザで http://localhost:3000 のクッキーを削除して、再度 http://localhost:3000 にアクセスし、Network タブから foo を選択し、リクエスト/レスポンスヘッダーを確認する。

xxx_session の他に XSRF-TOKEN というものがあるかと思う。これは VerifyCsrfToken が /foo ルートに割り当てられている場合に Laravel が自動的に生成するもの。CSRF 対策の一つとして利用される。ちなみに XSRF-TOKEN クッキーはフロントエンド側にて JavaScript で取得し加工した後にバックエンド側に送信する POST リクエスト等に含める必要があるため HttpOnly 属性は持っていない。

最後にフロントエンド側からバックエンドの /foo ルートに対して GET リクエストし、その後に /bar ルートに対して POST リクエストしてみる。

```php[data-file="routes/web.php"]
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/foo', fn() => ['message' => 'hello']);
Route::post('/bar', fn(Request $request) => ['message' => $request->input('message') === 'hello' ? 'hello from backend.' : '']);
```

```html[data-file="/path/to/frontend/index.html"]
<script>
  fetch("http://localhost:8000/foo", {
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  }).then((res) => {
    if (res.ok) {
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find((_) => _.startsWith("XSRF-TOKEN")) || "";
      const csrfToken = decodeURIComponent(cookie.split("=")[1]);

      fetch("http://localhost:8000/bar", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ message: "hello" })
      })
        .then((res) => res.json())
        .then((content) => console.log(content));
    }
  });
</script>
```

Web ブラウザに保存されているクッキーを削除し、再度 http://localhost:3000 にアクセスする。

Console タブを選択すると以下のレスポンスボディが返ってきているかと思う:

```shell
{message: 'hello from backend.'}
```

注目すべきところはまず Network タブ。foo は 1 つだが、bar は 2 つ表示されているはず。これは Web ブラウザがバックエンド側の /bar に対して 2 回リクエストしたことを示す。フロントエンド側のコードでは /bar に対してのリクエストは 1 回しかしていないはずなのに。

Status が 204 の bar を選択しリクエスト/レスポンスヘッダーを見てみる。

```
- Request Headers -
Access-Control-Request-Headers: content-type,x-xsrf-token
Access-Control-Request-Method: POST
Origin: http://localhost:3000
...

- Response Headers -
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: accept, content-type, origin, x-xsrf-token
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Max-Age: 0
...
```

これは何が発生したかというと、フロントエンド側がバックエンド側の /bar ルートに対してリクエストしようとした内容が複雑であると Web ブラウザが判断し、実際のリクエストをする前に、いくつかのリクエストヘッダーを使って Web ブラウザがバックエンドに対して安全なリクエストであるかを確認している。

これは Web ブラウザが自動的に行う。今回の例ではリクエストヘッダーの Content-Type が application/json であること、また、X-XSRF-TOKEN というリクエストヘッダーが存在すること、が発生要因として挙げられる。

ちなみにこのリクエストをプリフライトリクエストと呼ぶ。Options メソッドで送信され、安全であると判断されれば HTTP のレスポンスとして通常 204 が返ってくる。バックエンド側が許可していないリクエストヘッダーなどが使われていた場合、Web ブラウザがエラーを吐き通信はその時点で遮断される。

プリフライトリクエストが発生する条件はやや複雑なのでここでは省略する。[CORS 単純リクエスト](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS#%E5%8D%98%E7%B4%94%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88) などが参考になる。

## ログインアクションの実装

では、実際にログインアクションを実装してみる。ルートとしては以下 の 3 つを作成する:

1. GET /csrf-cookie
2. POST /login
3. GET /user

1 は CSRF 対策用のトークンを生成するアクション、2 はログインアクション、3 はログイン済みのユーザの名前を返すアクション。

Composer の create-project などで Laravel のプロジェクトが作成されていて、データベースの設定、マイグレーションの実行などが完了していると仮定して話を進めていく。また、試験用として以下の値を持ったユーザを 1 件追加しておく (password は Hash ファサードの make メソッドなどを使いハッシュ化する)。

```
name: foo
email: foo@example.com
password: foofoofoo
```

まずはルーティング (本当はコントローラを用意したり、ログインの処理ももう少しちゃんとする必要がある):

```php[data-file="routes/web.php"]
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

Route::get('/csrf-cookie', fn() =>
    response()->noContent()
);

Route::post('/login', function (Request $request) {
    if (Auth::attempt($request->input())) {
        $request->session()->regenerate();
        return response()->noContent();
    }
    return response(['message' => __('auth.failed')], 422);
})->middleware('guest');

Route::get('/user', fn(Request $request) =>
    ['name' => $request->user()->name]
)->middleware('auth');
```


```php[data-file="app/Providers/RouteServiceProvider.php"]
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->routes(fn() =>
            Route::middleware('web')
                ->namespace($this->namespace)
                ->group(base_path('routes/web.php'))
        );
    }
}
```

ミドルウェアは以下:

```php[data-file="app/Http/Kernel.php"]
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\EncryptCookies;
use App\Http\Middleware\RedirectIfAuthenticated;
use App\Http\Middleware\VerifyCsrfToken;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Session\Middleware\AuthenticateSession;
use Illuminate\Session\Middleware\StartSession;

class Kernel extends HttpKernel
{
    protected $middleware = [
        HandleCors::class,
    ];

    protected $middlewareGroups = [
        'web' => [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            AuthenticateSession::class,
            VerifyCsrfToken::class,
        ],
    ];

    protected $routeMiddleware = [
        'auth' => Authenticate::class,
        'guest' => RedirectIfAuthenticated::class,
        // ...
    ];
}
```

フロントエンド側:

```html[data-file="/path/to/frontend/index.html"]
<script>
  fetch("http://localhost:8000/csrf-cookie", {
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  }).then((res) => {
    if (res.ok) {
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find((_) => _.startsWith("XSRF-TOKEN")) || "";
      const csrfToken = decodeURIComponent(cookie.split("=")[1]);

      fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          email: "foo@example.com",
          password: "foofoofoo",
        })
      }).then((res) => {
        if (res.ok) {
          fetch("http://localhost:8000/user", {
            headers: {
              Accept: "application/json",
            },
            credentials: "include"
          })
            .then((res) => res.json())
            .then((content) => console.log(content));
        }
      });
    }
  });
</script>
```

/csrf-token に GET リクエストするといくつかのクッキーが Web ブラウザに保存される。それを取得した後 CSRF 対策用のクッキーとログインに必要な body を含めて /login に POST リクエストする。最後に /user に GET リクエストする。結果として Web ブラウザの Console 画面に以下が表示される。

```shell
{name:'foo'}
```

以上がおおまかではあるが、ログインの実装であり、ログインしたユーザの情報を取得する実装である。重要なのは、クッキーがいつどのように生成されて、どのような属性を持ち、どのように扱われているか。Web ブラウザや CORS の性質とともにそれらを理解していないと認証関連のアクションを実装するのはわりとおっかない。

## テストを書く

/csrf-token は body を持たないただの GET リクエストだが、ヘッダーには他のリクエストと同様に重要なクッキーの値がセットされている。そのためテストを書いて想定通りの値が返ってくるかを保証しておく。

というのも Laravel の重要なクッキーを送信するいくつかのミドルウェアは config/session.php に書かれている値に依存している。そのため、もし何かしらの原因でそれらの値が書き換えられた場合、想定外の何かが発生する恐れがある。

```php[data-file="tests/Features/CsrfCookieTest.php"]
namespace Tests\Feature;

use Carbon\Carbon;
use Tests\TestCase;

class CsrfCookieTest extends TestCase
{
    public function testAccessControlHeaders(): void
    {
        $this->getJson('/csrf-cookie')
            ->assertHeader('access-control-allow-origin', $this->app['config']->get('app.cors_origins'))
            ->assertHeader('access-control-allow-credentials', 'true');
    }

    public function testCsrfCookie(): void
    {
        $response = $this->getJson('/csrf-cookie');
        $setCookie = $response->headers->all('set-cookie');
        $this->assertCount(2, $setCookie);

        [$token, ] = $setCookie;

        $tokenValues = explode('; ', $token);
        $this->assertCount(5, $tokenValues);

        $this->assertMatchesRegularExpression('/\AXSRF-TOKEN=eyJpdiI.+\z/', $token);
        $this->assertContains('expires='.$this->expires(), $tokenValues);
        $this->assertContains('Max-Age=7200', $tokenValues);
        $this->assertContains('path=/', $tokenValues);
        $this->assertContains('samesite=lax', $tokenValues);
    }

    public function testSessionCookie(): void
    {
        $response = $this->getJson('/csrf-cookie');
        $setCookie = $response->headers->all('set-cookie');
        $this->assertCount(2, $setCookie);

        [, $session] = $setCookie;

        $sessionValues = explode('; ', $session);
        $this->assertCount(6, $sessionValues);

        $this->assertMatchesRegularExpression(
            '/\A'.str_replace('.', '', strtolower($this->app['config']->get('app.name'))).'_session=eyJpdiI.+\z/',
            $session
        );

        $this->assertContains('expires='.$this->expires(), $sessionValues);
        $this->assertContains('Max-Age=7200', $sessionValues);
        $this->assertContains('path=/', $sessionValues);
        $this->assertContains('httponly', $sessionValues);
        $this->assertContains('samesite=lax', $sessionValues);
    }

    public function testContent(): void
    {
        $this->getJson('/csrf-cookie')
            ->assertNoContent();
    }

    private function expires(): string
    {
        return (new Carbon)
            ->addMinutes((int)$this->app['config']->get('session.lifetime'))
            ->format('D, d-M-Y H:i:s').' GMT';
    }
}
```

どこまで細かく書くかは微妙なところだが、重要だと思う箇所はしっかりテストに書いて残しておく。

## Fetch API について

フロントエンド側で扱う fetch() メソッドについてもいくつか確認しておく。詳しくは [Fetch の使用](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch) で確認できる。

オプションについて:

- mode のデフォルト値は cors である
- credentials のデフォルト値は same-origin である

であるからして、今回のような環境 (クロスオリジンな環境) では mode は省略できる。credentials は include と明示する必要がある。

```js
fetch("http://localhost:8000/foo", {
  // mode: "cors",
  credentials: "include",
  // ...
});
```

また、[axios](https://github.com/axios/axios) などは Laravel が CSRF 対策として送信する XSRF-TOKEN クッキーを自動的に X-XSRF-TOKEN ヘッダーに設定する。fetch() メソッドでは手動でやらないといけない。

エラー処理について。fetch() も axios も非同期で処理が行われるが fetch() は通信障害 (バックエンド側のサーバがダウンしているなど) 以外はプロミスを拒否しない。

```js
// コメントの数値は HTTP のレスポンスのステータスコード
fetch("http://localhost:8000/foo")
  .then((response) => {
    console.log(response.ok); // true: 200 - 299 の範囲内, false: true の範囲外
    console.log(response.status): // 200 - 599 の範囲内
  })
  .catch((error) => {
    console.log(error); // サーバがダウンしたときなど
  });

axios.get("/foo")
  .then((response) => {
    // 200 - 299 の範囲内
  })
  .catch((error) => {
    console.log(error); // 200 - 299 の範囲外
  })
```

どちらがどうとかはなんとも言えないが、このように扱うライブラリによっていろいろな差異があるのでコードを書く際は注意する。

## その他のアクションについて

その他の認証関連のアクションについては [GitHub jamband/api.papers](https://github.com/jamband/api.papers) (バックエンド) や [GitHub jamband/papers-next](https://github.com/jamband/papers-next) (フロントエンド) などを参考にしてほしい。

また、[Laravel Breeze の api](https://github.com/laravel/breeze/tree/master/stubs/api) (バックエンド) や [Laravel Breeze Next.js Edition](https://github.com/laravel/breeze-next) (フロントエンド) なども参考になる (Laravel Breeze の api は Laravel Sanctum を使っているので注意)。

## まとめ

重要なことなので再度書くが、今回は以下のような環境を想定して、クッキーベースのセッション認証について説明した。

```
- in development environment -
Backend origin: http://localhost:8000
Frontend origin: http://localhost:3000

- in production environment -
Backend origin: https://api.example.com
Frontend origin: https://www.example.com
```

上記はつまり開発/本番環境ともに「cross-origin でありながら schemeful same-site」である。その中で Web ブラウザがどのような挙動をし、フロントエンド/バックエンド側ではどのような実装が必要になるのかを示した。

ただ Web アプリケーションの構成はこれだけではない。以下のような same-origin な構成になる場合もあるし、トークンベースの認証を採用するかもしれない。

```
- in development environment -
Backend origin: http://localhost:8000/api
Frontend origin: http://localhost:8000

- in production environment -
Backend origin: https://example.com/api
Frontend origin: https://example.com
```

そして、どのような構成になったとしても認証関連の実装は難しいのだが、IE 11 の終末を目の前にして、この記事を書きながら、Web ブラウザについてさらにより意識を向けないといけないなぁと、改めて思った。

## 関連リンク

- [HTTP Cookie の使用](https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies)
- [オリジン間リソース共有 (CORS)](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)
- [Fetch の使用](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch)
- [Protect your resources from web attacks with Fetch Metadata](https://web.dev/fetch-metadata/)
- [Laravel Breeze](https://github.com/laravel/breeze)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [jamband/api.papers](https://github.com/jamband/api.papers)
- [jamband/papers-next](https://github.com/jamband/papers-next)

## 備考

この記事ではセッション情報をバックエンド側にてファイルで管理している。これは Laravel のデフォルトの設定である。アプリケーションが複数の Web サーバで構成されている場合などはその他のセッションドライバーを検討する必要があるので注意する。
