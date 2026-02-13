# 実装ガイド: SkillCreator IPCハンドラー セキュリティ強化

## メタ情報

| 項目           | 値                                                                          |
| -------------- | --------------------------------------------------------------------------- |
| タスクID       | UT-9B-H-003                                                                 |
| Phase          | 12 (ドキュメント)                                                           |
| 実行日         | 2026-02-12                                                                  |
| 対象ファイル   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                         |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` |

---

## Part 1: 概念説明（中学生レベル）

### 家のセキュリティに例えて理解する

アプリのセキュリティ対策を、「家のセキュリティ」に置き換えて説明します。

---

### 1. パストラバーサル防止 = 裏口からの侵入防止

あなたの家（アプリ）には、正面玄関（正しいファイルパス）があります。家の中にはリビング（スキルフォルダ）やキッチン（タスクフォルダ）など、決められた場所があります。

しかし、泥棒（攻撃者）は正面玄関から入ろうとはしません。代わりに、こんな手口を使います。

| 攻撃手口           | 家の例え                                       | 実際の攻撃パターン                                                         |
| ------------------ | ---------------------------------------------- | -------------------------------------------------------------------------- |
| 裏口から入る       | 壁の穴を見つけて隣の部屋に入る                 | `../../etc/passwd`（上の階層に移動して秘密のファイルにアクセス）           |
| Windowsの裏口      | 別の入り口から侵入する                         | `..\windows\system32`（Windows特有の表記で上の階層に移動）                 |
| 透明インクの招待状 | 見えないインクで書かれた偽の招待状を使う       | `path\0evil`（NULLバイト: コンピュータを混乱させる見えない文字を埋め込む） |
| 他人の家の鍵を使う | ネットワーク経由で別のコンピュータの部屋に入る | `\\server\share`（UNCパス: 他のサーバーにアクセスを試みる）                |

**ガードマン（`validatePath` 関数）がIDチェックして、正面玄関以外からの侵入を全て拒否します。**

具体的には、ガードマンは以下をチェックします。

1. 招待状は空っぽではないか？（空文字チェック）
2. 透明インクの招待状ではないか？（NULLバイトチェック）
3. 他人の家の鍵ではないか？（UNCパスチェック）
4. 裏口から入ろうとしていないか？（`../` や `..\` チェック）

全てのチェックに合格した人だけが、正面玄関から入れます。

---

### 2. エラーサニタイズ = 家の間取りを外に漏らさない

もし家の中で何か問題が起きた場合（エラー発生時）、家の中の情報を外に漏らしてはいけません。

- 家の間取り図 = ファイルパス（`/Users/user/project/secret/file.ts`）
- 部屋の配置図 = スタックトレース（`at Function.run (/app/src/main.ts:42:10)`）
- 金庫の暗証番号 = APIキーやトークン（`token=abc123xyz`）

不審者（攻撃者）がインターホンを押して来ても、「お断りです」とだけ伝えます。家の中の構造や秘密は一切教えません。

**`sanitizeErrorMessage` 関数 = 情報フィルター付きインターホン**

このインターホンには4つのフィルターが内蔵されています。

| フィルター                 | 除去する情報           | 例                                           |
| -------------------------- | ---------------------- | -------------------------------------------- |
| スタックトレースフィルター | プログラムの実行経路   | `at Function.run (...)` を除去               |
| Unixパスフィルター         | サーバーのフォルダ構造 | `/Users/user/project/...` を `[path]` に置換 |
| Windowsパスフィルター      | PCのフォルダ構造       | `C:\Users\...` を `[path]` に置換            |
| 機密データフィルター       | パスワード・APIキー    | `token=abc123` を `token=***` にマスキング   |

もし来訪者がErrorオブジェクト以外のもの（文字列、null、undefined）を投げつけてきた場合は、「スキル作成処理でエラーが発生しました」という定型メッセージだけを返します。

---

### 3. ホワイトリスト = 許可された来客リスト

家にはあらかじめ「来ていい人リスト」（`ALLOWED_SCHEMA_NAMES`）が用意されています。

| 許可された人（スキーマ名） | 役割                     |
| -------------------------- | ------------------------ |
| `task-spec`                | タスク仕様書を検証する人 |
| `skill-spec`               | スキル仕様書を検証する人 |
| `mode`                     | モード設定を検証する人   |

リストに載っていない人は、たとえ正装していても（正しい形式の名前でも）、絶対に家に入れません。

- `unknown-schema` → リストにないので拒否
- `../../malicious` → リストにないので拒否（パストラバーサルも兼ねた攻撃）
- `Task-Spec` → 大文字・小文字が違うので拒否（リストは正確に照合する）
- `task-spec ` → 余計な空白があるので拒否

---

## Part 2: 開発者向け実装詳細

### 1. validatePath() の実装詳細

#### シグネチャ

```typescript
function validatePath(inputPath: string, _paramName: string): string | null;
```

#### パラメータ

| パラメータ   | 型       | 説明                                                                       |
| ------------ | -------- | -------------------------------------------------------------------------- |
| `inputPath`  | `string` | 検証対象のパス文字列                                                       |
| `_paramName` | `string` | エラーメッセージ用のパラメータ名（呼び出し元でエラーメッセージ構築に使用） |

#### 戻り値

- **成功時**: `path.resolve()` で正規化された絶対パス（`string`）
- **失敗時**: `null`

#### チェックパターン（検出順序）

| 順序 | チェック内容                    | 検出パターン                   | 対応する攻撃                |
| ---- | ------------------------------- | ------------------------------ | --------------------------- |
| 1    | 空文字 / falsy 値チェック       | `!inputPath`                   | 不正な引数                  |
| 2    | NULLバイトインジェクション      | `inputPath.includes("\0")`     | NULLバイト攻撃              |
| 3    | UNCパスチェック                 | `inputPath.startsWith("\\\\")` | リモートサーバーアクセス    |
| 4    | 上位ディレクトリ参照（Unix）    | `inputPath.includes("../")`    | パストラバーサル            |
| 5    | 上位ディレクトリ参照（Windows） | `inputPath.includes("..\\")`   | パストラバーサル（Windows） |

#### 使用箇所

| IPCハンドラー                 | 検証対象パラメータ                                                        |
| ----------------------------- | ------------------------------------------------------------------------- |
| `skill-creator:create`        | `tasksDir`, `skillDir`（どちらもオプショナル。`string` 型の場合のみ検証） |
| `skill-creator:execute-tasks` | `tasksDir`（必須）, `skillDir`（オプショナル）                            |
| `skill-creator:validate`      | `skillDir`（必須）                                                        |

#### コード

```typescript
function validatePath(inputPath: string, _paramName: string): string | null {
  if (!inputPath || inputPath.includes("\0")) {
    return null;
  }
  if (inputPath.startsWith("\\\\")) {
    return null;
  }
  if (inputPath.includes("../") || inputPath.includes("..\\")) {
    return null;
  }
  return path.resolve(inputPath);
}
```

---

### 2. sanitizeErrorMessage() の実装詳細

#### シグネチャ

```typescript
function sanitizeErrorMessage(error: unknown): string;
```

#### パラメータ

| パラメータ | 型        | 説明                                                                   |
| ---------- | --------- | ---------------------------------------------------------------------- |
| `error`    | `unknown` | キャッチされたエラーオブジェクト（実行時に `instanceof Error` で検証） |

#### 戻り値

- `string`: サニタイズ済みのエラーメッセージ

#### 処理フロー

1. `error instanceof Error` でない場合 → デフォルトメッセージ `"スキル作成処理でエラーが発生しました"` を返す
2. `Error` インスタンスの場合 → 4つの正規表現で内部情報を除去

#### 4つのサニタイズ正規表現パターン

| 定数名                   | 正規表現                                 | 除去対象                      | 置換先                                 |
| ------------------------ | ---------------------------------------- | ----------------------------- | -------------------------------------- |
| `STACK_TRACE_PATTERN`    | `/\n\s+at\s+.*/g`                        | スタックトレース行            | 空文字（除去）                         |
| `UNIX_PATH_PATTERN`      | `/\/[\w./\\-]+/g`                        | Unixファイルパス              | `[path]`                               |
| `WINDOWS_PATH_PATTERN`   | `/[A-Z]:\\[\w.\\-]+/gi`                  | Windowsファイルパス           | `[path]`                               |
| `SENSITIVE_DATA_PATTERN` | `/(token\|key\|password\|secret)=\S+/gi` | トークン・APIキー・パスワード | `$1=***`（キー名は残し値をマスキング） |

#### デフォルトメッセージ

```typescript
const DEFAULT_ERROR_MESSAGE = "スキル作成処理でエラーが発生しました";
```

以下の場合にデフォルトメッセージが返される。

- `error` が `Error` インスタンスでない場合（`null`, `undefined`, 文字列, 数値など）
- サニタイズ後のメッセージが空文字列になった場合

#### コード

```typescript
function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  let message = error.message;

  message = message.replace(STACK_TRACE_PATTERN, "");
  message = message.replace(UNIX_PATH_PATTERN, "[path]");
  message = message.replace(WINDOWS_PATH_PATTERN, "[path]");
  message = message.replace(SENSITIVE_DATA_PATTERN, "$1=***");

  return message || DEFAULT_ERROR_MESSAGE;
}
```

---

### 3. ALLOWED_SCHEMA_NAMES の定義と拡張方法

#### 定義

```typescript
const ALLOWED_SCHEMA_NAMES = ["task-spec", "skill-spec", "mode"] as const;
```

`as const` により、配列の要素が `"task-spec" | "skill-spec" | "mode"` のリテラル型として推論される。

#### 現在の許可済みスキーマ

| スキーマ名   | 用途                     |
| ------------ | ------------------------ |
| `task-spec`  | タスク仕様スキーマの検証 |
| `skill-spec` | スキル仕様スキーマの検証 |
| `mode`       | モードスキーマの検証     |

#### 検証方法

```typescript
if (
  !ALLOWED_SCHEMA_NAMES.includes(
    args.schemaName as (typeof ALLOWED_SCHEMA_NAMES)[number],
  )
) {
  return {
    success: false,
    error: `無効なスキーマ名が指定されました: ${args.schemaName}`,
  };
}
```

完全一致で検証するため、大文字小文字の違い、前後の空白、Unicode不可視文字が含まれるスキーマ名は全て拒否される。

#### 拡張手順

新しいスキーマを追加する場合は、以下の3ステップを実施する。

1. **ResourceLoader にスキーマファイルを追加**: 対応するJSONスキーマファイルをリソースに配置
2. **ALLOWED_SCHEMA_NAMES 配列にスキーマ名を追加**: `skillCreatorHandlers.ts` の配列に新しい名前を追加
3. **テストに対応するケースを追加**: `skillCreatorHandlers.security.test.ts` の `it.each` に新しいスキーマ名を追加

---

### 4. テスト実行方法

#### セキュリティテストのみ実行

```bash
pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security
```

#### 統合テスト含む全テスト実行

```bash
pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers
```

#### テストカテゴリ一覧

| カテゴリ                            | テスト数 | 検証内容                                                  |
| ----------------------------------- | -------- | --------------------------------------------------------- |
| パストラバーサル攻撃テスト          | 12件     | `../`, `..\`, NULLバイト, UNCパスの検出                   |
| エラーサニタイズテスト              | 7件      | ファイルパス除去, スタックトレース除去, APIキーマスキング |
| schemaNameホワイトリストテスト      | 7件      | 許可/拒否スキーマ名, 大文字小文字区別, Unicode不可視文字  |
| 正常系回帰テスト                    | 3件      | セキュリティ対策が正常動作を妨げないこと                  |
| 境界値テスト (validatePath)         | 3件      | 空文字, 相対パス, URLエンコード                           |
| 境界値テスト (sanitizeErrorMessage) | 6件      | 長大メッセージ, 空文字, null, undefined, 複合パターン     |
| 境界値テスト (ALLOWED_SCHEMA_NAMES) | 4件      | 大文字小文字, 空白, Unicode, SQLインジェクション          |
| セキュリティ検証優先順序テスト      | 3件      | 検証失敗時にサービス層に到達しないこと                    |
