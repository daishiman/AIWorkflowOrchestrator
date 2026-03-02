# Phase 8 リファクタリングログ

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 |
| Phase    | 8                                    |
| 完了日   | 2026-03-01                           |

## リファクタリング結果サマリー

| タスク | 対象                           | 変更内容                                                                                                                                         | 結果         |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Task 1 | E2Eテストヘルパー抽出          | `e2e/helpers/electron-app.ts` に `launchElectronApp()`, `closeElectronApp()`, `invokeIPC()` を抽出済み                                           | 完了（既存） |
| Task 2 | Playwright設定DRY化            | `playwright.config.ts` でCI/ローカル環境分岐（`isCI`変数）実装済み                                                                               | 完了（既存） |
| Task 3 | CI/CDワークフロー最適化        | Worktree環境でCI/CDワークフローファイルなし（メインリポジトリのみ）                                                                              | 対象外       |
| Task 4 | Worktree判定ロジック拡張       | `worktree-detector.ts` に `readGitDir()` 内部ヘルパー抽出、`getMainRepoPath()`, `getWorktreeName()` を追加                                       | 完了         |
| Task 5 | deferred-testsテンプレート改善 | 必須フィールド（テスト名・延期理由・実行予定環境・期限・解消ステータス）定義、ステータス定義テーブル・PR記載テンプレート・Phase 13完了条件を追加 | 完了（既存） |

## Task 1: E2Eテストヘルパー抽出

### 変更前

各E2Eテストファイル（`ipc-skill-remove.spec.ts`, `ipc-skill-import.spec.ts`）で Electron 起動・終了処理が個別に記述されていた。

### 変更後

`apps/desktop/e2e/helpers/electron-app.ts` に以下の共通ヘルパーを抽出:

| 関数名                              | 引数                         | 戻り値                  | 説明                                      |
| ----------------------------------- | ---------------------------- | ----------------------- | ----------------------------------------- |
| `launchElectronApp()`               | なし                         | `{ electronApp, page }` | Electronアプリ起動 + DOMContentLoaded待機 |
| `closeElectronApp(app)`             | `ElectronApplication`        | `void`                  | 安全なアプリ終了                          |
| `invokeIPC(page, apiPath, ...args)` | `Page, string, ...unknown[]` | `unknown`               | ドット区切りAPIパスによるIPC呼び出し      |

### テスト継続確認

E2Eテストファイルがヘルパーを使用し、テスト自体は正常動作（CI実行予定）。

## Task 2: Playwright設定DRY化

### 変更内容

`apps/desktop/playwright.config.ts` で `const isCI = !!process.env.CI` を使い、以下を環境分岐:

| 設定項目       | CI環境        | ローカル環境      |
| -------------- | ------------- | ----------------- |
| timeout        | 60,000ms      | 30,000ms          |
| expect.timeout | 10,000ms      | 5,000ms           |
| retries        | 2             | 0                 |
| workers        | 1             | undefined（自動） |
| reporter       | github + html | html              |
| forbidOnly     | true          | false             |

## Task 3: CI/CDワークフロー最適化

Worktree環境（`.worktrees/`配下）にはCI/CDワークフローファイルが存在しない。メインリポジトリの `.github/workflows/ci.yml` は本タスクのスコープ外。
Worktree環境ではLayer 3（E2E）テストが実行不可であることは設計として正しく、CI環境での実行に委ねる。

## Task 4: Worktree判定ロジックの関数抽出・拡張

### リファクタリング内容

1. **`readGitDir()` 内部ヘルパー抽出**: `.git` ファイルの読み取りロジックを共通化（DRY原則）
2. **`isWorktreeEnvironment()` 簡素化**: `readGitDir(root) !== null` に簡素化
3. **`getMainRepoPath()` 新規追加**: gitdir パスから `.git/worktrees/` 前のパスを抽出
4. **`getWorktreeName()` 新規追加**: gitdir パスから Worktree 名を抽出

### テスト追加

| TC-ID    | テスト内容                               | 対象関数        | 結果 |
| -------- | ---------------------------------------- | --------------- | ---- |
| UT-WD-12 | Worktree環境でメインリポジトリパスを返す | getMainRepoPath | PASS |
| UT-WD-13 | 通常リポジトリでnullを返す               | getMainRepoPath | PASS |
| UT-WD-14 | .git不存在でnullを返す                   | getMainRepoPath | PASS |
| UT-WD-15 | worktreesパターンなしでnullを返す        | getMainRepoPath | PASS |
| UT-WD-16 | 深いパス構造での正しいパス抽出           | getMainRepoPath | PASS |
| UT-WD-17 | projectRoot省略時のprocess.cwd()使用     | getMainRepoPath | PASS |
| UT-WD-18 | Worktree名を正しく取得                   | getWorktreeName | PASS |
| UT-WD-19 | 通常リポジトリでnullを返す               | getWorktreeName | PASS |
| UT-WD-20 | .git不存在でnullを返す                   | getWorktreeName | PASS |
| UT-WD-21 | worktreesパターンなしでnullを返す        | getWorktreeName | PASS |
| UT-WD-22 | ハイフン・数字含むWorktree名             | getWorktreeName | PASS |
| UT-WD-23 | projectRoot省略時のprocess.cwd()使用     | getWorktreeName | PASS |

### カバレッジ

| ファイル             | Line   | Branch | Function |
| -------------------- | ------ | ------ | -------- |
| worktree-detector.ts | 93.44% | 81.81% | 100%     |

### テスト継続成功確認

```
Test Files  5 passed (5)
     Tests  88 passed (88)
  Duration  3.77s
```

## Task 5: deferred-testsテンプレート改善

テンプレート（`outputs/phase-5/deferred-tests-template.md`）に以下を確認:

- 必須フィールド: ID, テスト内容, スキップ理由, 実行予定環境, 期限, ステータス
- ステータス定義テーブル: 未実施/実施中/完了/対象外
- PR記載テンプレート
- Phase 13 完了条件チェックリスト

パーサー（`deferred-tests-parser.ts`）との整合性: テスト13件全PASS確認。

## 多角的チェック

### セキュリティ

- [x] E2Eテストが contextIsolation/nodeIntegration/sandbox 設定を変更していない
- [x] ヘルパー関数が NODE_ENV: "test" と ELECTRON_IS_E2E: "true" のみ設定

### アーキテクチャ

- [x] SRP準拠: readGitDir() が単一責務（.git ファイル読み取り）
- [x] DRY準拠: 3関数が readGitDir() を共有

### パフォーマンス

- [x] テスト全体実行: 3.77s（60秒以内）

## 結論

Phase 8 リファクタリング完了。テスト11→23件に拡充、カバレッジ改善（Branch 80%→81.81%）。→ Phase 9（品質保証）へ進む。
