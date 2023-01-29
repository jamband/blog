---
title: Laravel as an API backend でのプロジェクトの構成について少しだけ考えてみる
created_at: "2021-02-15"
last_updated: "2023-01-29"
tags: [laravel]
---

## はじめに

Laravel で Backend な API を作る機会があったので、ついでにプロジェクトの構成についても「少しだけ」 考えてみた。

あまりやり過ぎると初学者には難しすぎるし、何もやらなければすぐ破綻する。プロジェクトと採用するフレームワークの特徴を掴んで、良い感じの落とし所を探っていく。

## 環境

- PHP 7.4.x
- Laravel 8.x

## ディレクトリ構成

GitHub にサンプルを用意したので、それを参考にしてほしい。

[GitHub: jamband/api.cameloz](https://github.com/jamband/api.cameloz)

とりあえずはまず Laravel が提供しているアプリケーションのディレクトリ構成にできる限り従い、「その中でやれることをやる」という形でいく。それでも何か難しい問題が発生した場合は、その時に考え、その時に対応する。

## ルーティング

まずは API の入り口であるルーター周り。ここではほぼほぼ何もやらない。各種ミドルウェアなどの割り当てもここではやらない。

```php[data-file="app/Providers/RouteServiceProvider.php"]
declare(strict_types=1);

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->routes(function () {
            $this->createGroups([
                'projects',
                'tasks',
                'task_priorities',
            ]);
        });
    }

    protected function createGroups(array $groups): void
    {
        foreach ($groups as $group) {
            Route::prefix($group)->group(
                base_path('routes/'.$group.'.php')
            );
        }
    }
}
```

グループ事にファイルを分ける。それだけやっておく。こうすることによってエンドポイントが増えていってもある程度までは対応できる。

以下は projects グループのルート:

```php[data-file="routes/projects.php"]
declare(strict_types=1);

use App\Http\Controllers\Project\{
    CreateProject,
    DeleteProject,
    GetProject,
    GetProjects,
    UpdateProject,};
use Illuminate\Support\Facades\Route;

Route::pattern('project', '[\d]+');

Route::get('', GetProjects::class);
Route::get('{project}', GetProject::class);
Route::post('', CreateProject::class);
Route::put('{project}', UpdateProject::class);
Route::delete('{project}', DeleteProject::class);
```

良い感じにコントローラに繋げるために、シングルアクションコントローラを使うようにする。定義元のコントローラにジャンプすれば、そこには一つのエンドポイントの処理のみが書いてある。他のアクションのことは一旦忘れる。目の前のアクションに集中する。という構成。

## ミドルウェア

グローバルなミドルウェアなどは以下で構成する:

```php[data-file="app/Http/Kernel.php"]
declare(strict_types=1);

namespace App\Http;

use App\Http\Middleware\PreventRequestsDuringMaintenance;
use App\Http\Middleware\TrimStrings;
use App\Http\Middleware\TrustHosts;
use App\Http\Middleware\TrustProxies;
use Fruitcake\Cors\HandleCors;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\ValidatePostSize;
use Illuminate\Routing\Middleware\SubstituteBindings;

class Kernel extends HttpKernel
{
    protected $middleware = [
        ConvertEmptyStringsToNull::class,
        HandleCors::class,
        PreventRequestsDuringMaintenance::class,
        TrimStrings::class,
        TrustHosts::class,
        TrustProxies::class,
        ValidatePostSize::class,
    ];

    protected $routeMiddleware = [
        'bindings' => SubstituteBindings::class,
    ];

    protected $middlewarePriority = [
        SubstituteBindings::class,
    ];
}
```

$routeMiddleware は本当は短縮キーを使用せずにコントローラに直接書きたかったが (定義元にジャンプできるので)、オプション等が必要なミドルウェアを割り当てる場合に上手く書くことができなかったため諦めた。

## コントローラ

コントローラの構成は以下:

- ベースのコントローラ
- ベースのコントローラを継承したグループのコントローラ
- グループのコントローラを継承したシングルアクションコントローラ

この 3 段階構成でいく。ベースのコントローラとグループのコントローラには極力何も書かない。まずはシングルアクションコントローラに具体的な処理を書くようにし、どうしても必要な場合にグループのコントローラに書く。それでも問題がある場合にベースのコントローラに書く。という構成。

こうすることによってどのエンドポイントでどのようなミドルウェアが割当たっているかなどの見通しが良くなる。

以下はこの 3 段階構成の例:

```php[data-file="app/Http/Controllers/Controller.php"]
declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    public function __construct()
    {
    }
}
```

```php[data-file="app/Http/Controllers/Project/Controller.php"]
declare(strict_types=1);

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller as BaseController;

class Controller extends BaseController
{
    public function __construct()
    {
        parent::__construct();
    }
}
```

```php[data-file="app/Http/Controllers/Project/DeleteProject.php"]
declare(strict_types=1);

namespace App\Http\Controllers\Project;

use App\Models\Project;
use Illuminate\Http\Response;

class DeleteProject extends Controller
{
    public function __construct()
    {
        parent::__construct();

        $this->middleware([
            'bindings',
        ]);
    }

    public function __invoke(Project $project): Response
    {
        $project->delete();

        return response()->noContent();
    }
}
```

例はシンプルだが、実際には認可処理であったり、あーだこーだいろいろなものが入りこんでくるので、そういった場合にいかに見通しがよくなるように構成していくかというのが重要かなと思う。

## 認可とバリデーション

コントローラを小さく保つために [Form Request Validation](https://laravel.com/docs/8.x/validation#form-request-validation) を使う。一つのアクションに対して一つの Form Request を持つようにする。共通の Form Request などは却って複雑に成りかねないので持たせない。

## テスト

プロジェクトが Backend な API であること、また Laravel では HTTP テストがとても書きやすく軽いということ (Laravel 8.25.x 以降ではテストの並列実行も可能になった)、などの特徴を踏まえて、API の出口である HTTP テストを充実させるという方向でいく。

このような経緯に至った理由としては、とにかくForm Request のテストが非常に書きにくく、ある時点になると負債になりかねないと感じたから。

また、API リソースなども単体ではテストは書かず、HTTP テストで補う。ただ、モデルなどのテストはちゃんと書く。そういう構成にした。

## まとめ

とりあえずこのような構成で始めてみる。いずれ問題が発生するかもしれないが、何か難しい問題が発生しつつある場合は、その時に考え、その時に対応する。そのために小さな準備を開発初期の段階でやっておく。

## 参考リンク

- [Laravel で Request, UseCase, Resource を使いコントロールフローをシンプルにする - Qiita](https://qiita.com/nunulk/items/5297cce4545ac3c16822)
- [5年間 Laravel を使って辿り着いた，全然頑張らない「なんちゃってクリーンアーキテクチャ」という落としどころ](https://zenn.dev/mpyw/articles/ce7d09eb6d8117)

## 関連リンク

- [GitHub: jamband/api.cameloz](https://github.com/jamband/api.cameloz)
