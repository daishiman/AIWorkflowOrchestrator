# 実装ガイド - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | UT-TASK06-007                                 |
| 作成日     | 2026-03-18                                    |
| Phase      | 12 - ドキュメント                             |
| 対象成果物 | `apps/desktop/scripts/check-ipc-contracts.ts` |

---

## Part 1: 中学生でもわかる概念説明

### お店の注文票と厨房の調理指示書

レストランを想像してください。お客さんが「ラーメン1杯」と注文票に書いてウェイターに渡します。ウェイターはその注文票を厨房に届けます。厨房では調理指示書に従って料理を作ります。

このとき、注文票と調理指示書の内容がズレていたらどうなるでしょう？

- 注文票: 「ラーメン1杯」
- 調理指示書: 「うどんセット」

お客さんは全然違う料理を受け取ることになります。

**Electronアプリでも同じことが起きます。**

| レストランの例             | Electronアプリの例         |
| -------------------------- | -------------------------- |
| お客さん                   | 画面（Renderer）           |
| ウェイター（注文票を渡す） | Preload層                  |
| 厨房（調理指示書で動く）   | Main Process               |
| 注文票                     | Preload側のIPC呼び出し定義 |
| 調理指示書                 | Main側のIPCハンドラ定義    |

このズレのことを **「IPC契約ドリフト」** と呼びます。

### 4つのズレパターン（検出ルール）

#### R-01: 注文票はあるけど調理指示書がない（またはその逆）

```
注文票: 「ラーメン1杯」
調理指示書: （ラーメンのメニューが存在しない）
```

Preload側では「このコマンドを呼べます」と約束しているのに、Main側にそのハンドラが存在しない状態です。呼び出してもエラーになります。

逆に、Main側にハンドラがあるのにPreload側で公開していないケースもあります（未公開の機能）。

#### R-02: 注文票には「ラーメン1杯」、指示書には「うどんセット」

```
注文票: skillName を渡す
調理指示書: skillId を期待する
```

チャンネル名は合っているのに、渡す引数の形式や名前が違います。これがP44/P45で記録された「引数命名の契約ドリフト」です。スクリプトが渡す値と、受け取る側が期待する値のセマンティクスがズレています。

#### R-03: 注文票に正式メニュー番号ではなく手書きメモで書いてある

```
正しい: IPC_CHANNELS.SKILL_IMPORT を使う
問題あり: "skill:import" という文字列を直接書く
```

チャンネル名を定数（`IPC_CHANNELS`）で管理せず、文字列リテラルで直接書いているケースです。タイポが発生しても気付きにくく、後でリファクタリングするときも大変です（P27パターン）。

#### R-04: 注文票があるのに厨房に伝わっていない

```
IPC_CHANNELS に定義されているチャンネル名が
ipcMain.handle() に登録されていない
```

定数ファイルにチャンネルが定義されているのに、実際のハンドラ登録が漏れているケースです。ウェイターが注文票を持っているのに厨房に届けるルートがない状態です。

### このスクリプトが自動でやること

このスクリプトを実行すると、プロジェクト全体のコードを自動で調べて、上記4つのズレを一覧表示してくれます。

```
実行結果の例:
[DRIFT] R-01: チャンネル "skill:execute" はPreloadで公開されているがMainにハンドラがない
[DRIFT] R-03: ファイル preload/skill-api.ts L42 でチャンネル名が文字列リテラル "skill:import"
[OK] 検出されたドリフト: 2件
```

---

## Part 2: 開発者向け技術詳細

### ファイル構成

| ファイル                                                     | 役割                      |
| ------------------------------------------------------------ | ------------------------- |
| `apps/desktop/scripts/check-ipc-contracts.ts`                | メインスクリプト（478行） |
| `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | テストスイート            |

### 主要関数の説明

#### `extractMainHandlers(dir: string): HandlerEntry[]`

**役割**: Main Process ディレクトリを走査し、`ipcMain.handle()` の呼び出しを正規表現で抽出する。

**動作**:

1. `apps/desktop/src/main/` 配下のすべての `.ts` ファイルを再帰的に読み込む
2. `ipcMain.handle(チャンネル名, ...)` のパターンにマッチする行を抽出
3. チャンネル名が `IPC_CHANNELS.XXX` 形式か文字列リテラルかを判別
4. `HandlerEntry[]` として返す

**戻り値の型**:

```typescript
interface HandlerEntry {
  channel: string; // 解決済みチャンネル名
  rawExpression: string; // ソース上の元の表現
  filePath: string; // ファイルパス
  lineNumber: number; // 行番号
  isLiteral: boolean; // 文字列リテラルかどうか (R-03検出用)
}
```

#### `extractPreloadEntries(dir: string): PreloadEntry[]`

**役割**: Preload ディレクトリを走査し、`safeInvoke()` / `safeOn()` の呼び出しを抽出する。

**動作**:

1. `apps/desktop/src/preload/` 配下のすべての `.ts` ファイルを走査
2. `safeInvoke(チャンネル名, ...)` と `safeOn(チャンネル名, ...)` にマッチする行を抽出
3. `PreloadEntry[]` として返す

#### `resolveChannelMap(channelConstFile: string): Map<string, string>`

**役割**: `IPC_CHANNELS` 定数オブジェクトを解析し、`識別子名 -> チャンネル文字列値` のマップを生成する。

**動作**:

1. `apps/desktop/src/shared/ipc-channels.ts` を読み込む
2. `XXX: "channel:name"` 形式のプロパティをすべて抽出
3. `Map<string, string>` として返す（例: `"SKILL_IMPORT" -> "skill:import"`）

#### `matchAndValidate(handlers, preloadEntries, channelMap): DriftReport`

**役割**: ハンドラとPreloadエントリを突き合わせ、4つのルールに基づいてドリフトを検出する。

**検出ロジック**:

| ルール | 検出条件                                                    |
| ------ | ----------------------------------------------------------- |
| R-01   | Preloadにあり → Mainにハンドラが存在しない、またはその逆    |
| R-02   | チャンネルの引数型/名称の乖離（静的解析による近似検出）     |
| R-03   | `isLiteral === true` のエントリ（文字列リテラルの直接使用） |
| R-04   | `channelMap` に存在するチャンネルが `handlers` に未登録     |

#### `generateReport(driftReport: DriftReport, format: "markdown" | "json"): string`

**役割**: ドリフトレポートを指定フォーマットで文字列化する。

- `markdown` 形式: Markdown テーブルと箇条書きで人間が読みやすい形式
- `json` 形式: CI/CDパイプラインで機械処理しやすい形式

#### `main(argv: string[]): Promise<void>`

**役割**: CLIエントリポイント。引数をパースして各関数を順次呼び出す。

**処理フロー**:

```
1. argv をパースしてオプション取得
2. extractMainHandlers() でMainハンドラを収集
3. extractPreloadEntries() でPreloadエントリを収集
4. resolveChannelMap() でチャンネルマップを構築
5. matchAndValidate() でドリフト検出
6. generateReport() でレポート生成
7. --report-only でなければ exit code を設定
```

### CLIオプション

| オプション      | 型                   | デフォルト | 説明                                               |
| --------------- | -------------------- | ---------- | -------------------------------------------------- |
| `--report-only` | flag                 | false      | ドリフトがあってもexit 0で終了（レポート出力のみ） |
| `--strict`      | flag                 | false      | R-04（登録漏れ）を厳格にエラー扱いする             |
| `--format`      | `json` \| `markdown` | `markdown` | 出力フォーマット                                   |

### 実行方法

```bash
# レポートのみ出力（CIを失敗させない）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only

# JSON形式で出力（CI連携用）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --format json

# 厳格モード（ドリフト検出時にexit 1）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict

# package.jsonスクリプトから実行
pnpm --filter @repo/desktop check-ipc-contracts
```

### 検出ルール詳細

#### R-01: ハンドラ存在チェック（Existence Check）

```typescript
// 検出パターン
const preloadChannels = new Set(preloadEntries.map((e) => e.channel));
const mainChannels = new Set(handlers.map((h) => h.channel));

// Preloadにあり、Mainにない
for (const ch of preloadChannels) {
  if (!mainChannels.has(ch)) {
    report.r01.push({ channel: ch, direction: "preload-only" });
  }
}
```

#### R-02: 引数セマンティクスチェック（Semantic Check）

静的解析の制約から、引数名の比較に限定した近似検出を行う。`skillId` と `skillName` の混在（P45パターン）が主な検出対象。

#### R-03: 文字列リテラルチェック（Literal Check）

```typescript
// 文字列リテラル直接使用の検出
const LITERAL_PATTERN = /safeInvoke\s*\(\s*["'`]([^"'`]+)["'`]/;
```

#### R-04: チャンネル登録漏れチェック（Registration Check）

`IPC_CHANNELS` に定義された全チャンネルが `ipcMain.handle()` で登録されているかを確認する。

### 既知の制約

| 制約ID | 内容                                                              | 対応未タスク          |
| ------ | ----------------------------------------------------------------- | --------------------- |
| C-01   | `[IPC_CHANNELS.XXX, handler]` 形式のタプル配列経由ハンドラ未対応  | UT-TASK06-007-EXT-001 |
| C-02   | `CHAT_EDIT_CHANNELS` 等の別定数オブジェクトのチャンネル解決未対応 | UT-TASK06-007-EXT-002 |
| C-03   | `ipcMain.on` パターンの検証が第1フェーズのみ（完全網羅でない）    | UT-TASK06-007-EXT-003 |
| C-04   | スクリプト本体が478行（200行目安を超過）                          | リファクタリング検討  |

### テスト構成

テストファイル: `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`

| テストスイート          | 内容                                 |
| ----------------------- | ------------------------------------ |
| `extractMainHandlers`   | 正常抽出、ファイル不在、リテラル検出 |
| `extractPreloadEntries` | safeInvoke/safeOn の各パターン抽出   |
| `resolveChannelMap`     | 定数解析、ネスト構造対応             |
| `matchAndValidate`      | R-01～R-04 各ルールの検出ロジック    |
| `generateReport`        | markdown/json 両形式の出力検証       |
| `main` (integration)    | CLIオプションの組み合わせテスト      |

### 注意事項

- スクリプトは静的解析ベースであり、動的に生成されるチャンネル名は検出できない
- `resolveChannelMap` は `IPC_CHANNELS` オブジェクトの直接プロパティのみ解析する（ネストした定数オブジェクトは C-02 参照）
- テスト実行は worktree 環境での esbuild プラットフォーム不一致を避けるため、`pnpm tsx` 経由を推奨する（P7/P63 参照）
