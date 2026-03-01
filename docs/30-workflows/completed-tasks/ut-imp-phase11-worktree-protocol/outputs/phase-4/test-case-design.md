# Phase 4 テストケース設計書

## メタ情報

| 項目          | 値                                            |
| ------------- | --------------------------------------------- |
| タスクID      | UT-IMP-PHASE11-WORKTREE-PROTOCOL              |
| 作成日        | 2026-03-01                                    |
| 作成者        | Claude Code                                   |
| Phase         | 4（テスト作成）                               |
| 依存成果物    | phase-3-design-review.md（設計レビュー PASS） |
| 次Phase成果物 | phase-5-implementation.md（実装）             |

## 目的

Worktree 環境における Phase 11 手動テストプロトコルを実装するにあたり、以下の3レイヤーのテストケースを設計する。

- **Layer 1（ユニットテスト）**: Vitest で Worktree 環境でも実行可能なテスト
- **Layer 2（静的解析）**: 型チェック・Lint による契約検証
- **Layer 3（E2E・UI操作）**: Playwright/DevTools を使用した実環境テスト（CI/メインリポジトリで実施）

---

## ユニットテスト一覧（Layer 1）

### worktree-detector.ts（5ケース）

実装ファイル: `apps/desktop/src/main/utils/worktree-detector.ts`
テストファイル: `apps/desktop/src/main/utils/__tests__/worktree-detector.test.ts`

| ID       | テスト内容                                          | 期待結果 | 優先度 |
| -------- | --------------------------------------------------- | -------- | ------ |
| UT-WD-01 | `.git` がディレクトリの場合                         | `false`  | 高     |
| UT-WD-02 | `.git` がファイルで内容が `gitdir:` で始まる場合    | `true`   | 高     |
| UT-WD-03 | `.git` が存在しない（ENOENT）場合                   | `false`  | 高     |
| UT-WD-04 | `.git` ファイル内容が絶対パスの `gitdir:` で始まる  | `true`   | 中     |
| UT-WD-05 | `.git` ファイル内容が不正（`gitdir:` で始まらない） | `false`  | 中     |

### deferred-tests-parser.ts（6ケース）

実装ファイル: `apps/desktop/src/main/utils/deferred-tests-parser.ts`
テストファイル: `apps/desktop/src/main/utils/__tests__/deferred-tests-parser.test.ts`

| ID       | テスト内容                          | 期待結果                              | 優先度 |
| -------- | ----------------------------------- | ------------------------------------- | ------ |
| UT-DP-01 | 有効なテーブルから項目を抽出        | items 配列に1件、各フィールド正常     | 高     |
| UT-DP-02 | 空文字列をパース                    | items が空配列、allResolved true      | 高     |
| UT-DP-03 | テーブル形式が不正（Markdown なし） | `ParseError` を throw                 | 高     |
| UT-DP-04 | 全項目のステータスが「完了」        | `allResolved === true`                | 高     |
| UT-DP-05 | 一部項目のステータスが「未実施」    | `allResolved === false`               | 高     |
| UT-DP-06 | `null` を渡した場合                 | `DeferredTestsNotFoundError` を throw | 高     |

### test-layer-classifier.ts（7ケース）

実装ファイル: `apps/desktop/src/main/utils/test-layer-classifier.ts`
テストファイル: `apps/desktop/src/main/utils/__tests__/test-layer-classifier.test.ts`

| ID       | テスト内容                                          | 期待結果 | 優先度 |
| -------- | --------------------------------------------------- | -------- | ------ |
| UT-LC-01 | `vitest` runner、Electron不要 → Layer 1             | `1`      | 高     |
| UT-LC-02 | `typecheck` runner、Electron不要 → Layer 2          | `2`      | 高     |
| UT-LC-03 | `playwright` runner、Electron必要、UI必要 → Layer 3 | `3`      | 高     |
| UT-LC-04 | `devtools` runner、Electron必要、UI必要 → Layer 3   | `3`      | 高     |
| UT-LC-05 | Layer 1 は Worktree で実行可能                      | `true`   | 高     |
| UT-LC-06 | Layer 2 は Worktree で実行可能                      | `true`   | 高     |
| UT-LC-07 | Layer 3 は Worktree で実行不可                      | `false`  | 高     |

**ユニットテスト合計: 18ケース**

---

## E2Eテスト一覧（Layer 3）

> **注意**: E2E テストは Electron を起動する必要があるため、Worktree 環境では実行不可。
> CI またはメインリポジトリでのみ実施。Layer 3 テストとして `deferred-tests.md` に記録する。

### skill:remove IPC E2E（5ケース）

実装ファイル: `apps/desktop/e2e/ipc-skill-remove.spec.ts`

| ID        | テスト内容                                      | 期待結果                      | 優先度 |
| --------- | ----------------------------------------------- | ----------------------------- | ------ |
| E2E-SR-01 | 存在するスキルの削除が成功する                  | 結果オブジェクトが返る        | 高     |
| E2E-SR-02 | 削除がアプリ再起動後も永続化される              | 再起動後のリストに含まれない  | 高     |
| E2E-SR-03 | 存在しないスキル名でエラーレスポンスを返す      | `code` フィールドを持つエラー | 高     |
| E2E-SR-04 | 空文字列でバリデーションエラーを返す            | `code: "VALIDATION_ERROR"`    | 高     |
| E2E-SR-05 | スペースのみでバリデーションエラーを返す（P42） | `code: "VALIDATION_ERROR"`    | 高     |

### skill:import IPC E2E（5ケース）

実装ファイル: `apps/desktop/e2e/ipc-skill-import.spec.ts`

| ID        | テスト内容                                      | 期待結果                      | 優先度 |
| --------- | ----------------------------------------------- | ----------------------------- | ------ |
| E2E-SI-01 | 有効なスキル名のインポートが成功する            | 結果オブジェクトが返る        | 高     |
| E2E-SI-02 | インポートがアプリ再起動後も永続化される        | 再起動後のリストに含まれる    | 高     |
| E2E-SI-03 | 存在しないスキル名でエラーレスポンスを返す      | `code` フィールドを持つエラー | 高     |
| E2E-SI-04 | 空文字列でバリデーションエラーを返す            | `code: "VALIDATION_ERROR"`    | 高     |
| E2E-SI-05 | スペースのみでバリデーションエラーを返す（P42） | `code: "VALIDATION_ERROR"`    | 高     |

**E2Eテスト合計: 10ケース**

---

## CI統合テスト設計（4ケース）

CI パイプラインで自動実行されるテスト群の設計。

| ID    | テスト内容                                                  | 実行環境               | 優先度 |
| ----- | ----------------------------------------------------------- | ---------------------- | ------ |
| CI-01 | Layer 1 ユニットテスト（18ケース）を pnpm vitest run で実行 | 全環境（Worktree含む） | 高     |
| CI-02 | Layer 2 型チェックを pnpm typecheck で実行                  | 全環境（Worktree含む） | 高     |
| CI-03 | Layer 3 E2Eテストを playwright で実行                       | CI / メインリポジトリ  | 高     |
| CI-04 | deferred-tests.md の全項目が「完了」または「対象外」か確認  | PRマージ前（ゲート）   | 中     |

**CI統合テスト合計: 4ケース**

---

## 受入基準カバレッジマトリクス

Phase 1 で定義した受入基準（AC-01〜AC-16）と各テストケースの対応。

| 受入基準ID | 内容概要                                         | 対応テストケース     |
| ---------- | ------------------------------------------------ | -------------------- |
| AC-01      | isWorktreeEnvironment が正確に判定する           | UT-WD-01〜UT-WD-05   |
| AC-02      | .git ファイル形式で true を返す                  | UT-WD-02, UT-WD-04   |
| AC-03      | .git ディレクトリ形式で false を返す             | UT-WD-01             |
| AC-04      | .git 不在で false を返す                         | UT-WD-03             |
| AC-05      | deferred-tests.md を正確にパースする             | UT-DP-01〜UT-DP-06   |
| AC-06      | 全項目完了時に allResolved === true              | UT-DP-04             |
| AC-07      | 未解消項目時に allResolved === false             | UT-DP-05             |
| AC-08      | ファイル不在時に DeferredTestsNotFoundError      | UT-DP-06             |
| AC-09      | テスト Layer 分類が正確                          | UT-LC-01〜UT-LC-04   |
| AC-10      | Layer 1 が Worktree で実行可能                   | UT-LC-05             |
| AC-11      | Layer 2 が Worktree で実行可能                   | UT-LC-06             |
| AC-12      | Layer 3 が Worktree で実行不可                   | UT-LC-07             |
| AC-13      | skill:remove IPC が P42 準拠バリデーションを持つ | E2E-SR-04, E2E-SR-05 |
| AC-14      | skill:import IPC が P42 準拠バリデーションを持つ | E2E-SI-04, E2E-SI-05 |
| AC-15      | 削除・インポートが再起動後も永続化される         | E2E-SR-02, E2E-SI-02 |
| AC-16      | 存在しないスキルへの操作でエラーを返す           | E2E-SR-03, E2E-SI-03 |

---

## テスト合計サマリー

| カテゴリ         | ケース数 | 実行環境                |
| ---------------- | -------- | ----------------------- |
| ユニットテスト   | 18       | Worktree / CI（全環境） |
| E2Eテスト        | 10       | CI / メインリポジトリ   |
| CI統合テスト設計 | 4        | CI                      |
| **合計**         | **32**   |                         |

---

## 完了条件

- [x] ユニットテスト18ケースのテストコードが作成済みであること
- [x] E2Eテスト10ケースのテストコードが作成済みであること
- [x] CI統合テスト4ケースの設計が完了していること
- [x] 受入基準 AC-01〜AC-16 が全テストケースでカバーされていること
- [x] 実装ファイルの設計（インターフェース・型）が確定していること

## 次Phase

Phase 5（実装）: 上記テストが PASS するよう実装ファイルを作成する。

- `apps/desktop/src/main/utils/worktree-detector.ts`
- `apps/desktop/src/main/utils/deferred-tests-parser.ts`
- `apps/desktop/src/main/utils/test-layer-classifier.ts`
