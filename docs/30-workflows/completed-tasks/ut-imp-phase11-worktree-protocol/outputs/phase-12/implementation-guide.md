# 実装ガイド — Phase 11 Worktree環境テストプロトコル標準化

## Part 1: 概念的説明（初学者向け）

### Worktree環境の制約とは何か

#### なぜWorktree環境が必要か

ソフトウェア開発では、「今の作業を中断せずに、別の修正を同時に行いたい」という場面があります。Gitの **Worktree**（ワークツリー）は、1つのリポジトリから複数の作業フォルダを作り出す機能で、ブランチの切り替えなしに複数の作業を並行できます。

#### 日常生活での例え

本棚のある部屋を想像してください。本棚の本（ソースコード）は別の部屋にコピーして持っていけますが、CDプレーヤー（Electronアプリ）は元の部屋にしかありません。

- **元の部屋**（メインリポジトリ）: 本もCDプレーヤーもある。すべてのテストができる
- **別の部屋**（Worktree環境）: 本だけ持ってきた。本の内容チェックはできるが、CDを再生するテストはできない

だから、CDプレーヤーを使うテスト（E2Eテスト）は元の部屋に戻ってから実行する必要があります。

#### 3層テスト分類の概念的説明

| テストの種類                              | 日常の例え                         | どこでできるか         |
| ----------------------------------------- | ---------------------------------- | ---------------------- |
| **Layer 1**: 自動テスト（ユニット）       | 本の中身を読んで間違いを探す       | 別の部屋でもできる     |
| **Layer 2**: 静的解析（型チェック・Lint） | 本の目次と中身が一致するか確認する | 別の部屋でもできる     |
| **Layer 3**: E2Eテスト（Electron）        | CDプレーヤーで音楽を再生して確認   | 元の部屋でしかできない |

#### 延期テストの管理

別の部屋でできなかったテスト（Layer 3）は「メモ帳」（deferred-tests.md）に書き留めます。元の部屋に戻ったとき（メインリポジトリでCI実行時）に、メモを見ながらテストを実行します。

---

## Part 2: 技術的詳細（開発者向け）

### 1. 3層テスト分類の技術的根拠

| Layer | テスト種別                   | 実行環境       | Worktree実行 | 根拠                                                         |
| ----- | ---------------------------- | -------------- | ------------ | ------------------------------------------------------------ |
| 1     | Vitest ユニットテスト        | Node.js        | 可能         | Node.jsとファイルシステムのみ依存。Electronバイナリ不要      |
| 2     | TypeScript Compiler + ESLint | Node.js        | 可能         | ソースコード解析のみ。ネイティブモジュール不要               |
| 3     | Playwright + Electron        | Electron + GPU | 不可         | ネイティブモジュール（electron）のビルドがWorktreeで失敗する |

#### Layer判定ロジック（`test-layer-classifier.ts`）

```typescript
export function classifyTestLayer(testItem: TestItem): TestLayer {
  if (testItem.requiresElectron || testItem.requiresUI) return 3;
  if (testItem.type === "typecheck" || testItem.type === "lint") return 2;
  return 1;
}

export function canRunInWorktree(layer: TestLayer): boolean {
  return layer <= 2;
}
```

### 2. Worktree環境判定（`worktree-detector.ts`）

3つの公開関数:

| 関数                           | 戻り値           | 用途                     |
| ------------------------------ | ---------------- | ------------------------ |
| `isWorktreeEnvironment(root?)` | `boolean`        | 環境判定                 |
| `getMainRepoPath(root?)`       | `string \| null` | メインリポジトリパス取得 |
| `getWorktreeName(root?)`       | `string \| null` | Worktree名取得           |

判定原理: `.git` がファイルかディレクトリかで判定。Worktreeでは `.git` ファイルに `gitdir: /path/to/repo/.git/worktrees/<name>` が記載される。

### 3. Playwright E2Eテスト設定

#### `playwright.config.ts`

CI/ローカル自動分岐:

- `timeout`: CI 60秒 / ローカル 30秒
- `retries`: CI 2回 / ローカル 0回
- `workers`: CI 1 / ローカル 自動

#### E2Eテストヘルパー（`e2e/helpers/electron-app.ts`）

| 関数                                | 説明                                |
| ----------------------------------- | ----------------------------------- |
| `launchElectronApp()`               | Electron起動 + DOMContentLoaded待機 |
| `closeElectronApp(app)`             | 安全なアプリ終了                    |
| `invokeIPC(page, apiPath, ...args)` | ドット区切りAPIパスでIPC呼び出し    |

### 4. deferred-tests追跡ワークフロー

1. Phase 11実行時にWorktree環境を判定
2. Layer 3テストを `outputs/phase-11/deferred-tests.md` に記録
3. PR作成時にdeferred-testsの件数をPR本文に記載
4. Phase 13でCI実行後、deferred-testsの解消チェックを実施
5. 全項目「完了」または「対象外」でPhase 13完了

#### `parseDeferredTests()` パーサー

`deferred-tests-parser.ts` でMarkdownテーブルをパースし、未解消項目の有無を判定する。

### 5. 関連Pitfall

| ID  | 内容                            | 対策                                        |
| --- | ------------------------------- | ------------------------------------------- |
| P40 | テスト実行ディレクトリ依存      | `cd apps/desktop && pnpm vitest run` で実行 |
| P11 | PostToolUseフックによるEdit失敗 | 大量編集後は `git diff --stat` で確認       |
| P42 | .trim()バリデーション漏れ       | 3段バリデーション標準化                     |
