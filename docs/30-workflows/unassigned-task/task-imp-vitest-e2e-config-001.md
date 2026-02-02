# 未タスク指示書: Vitest+Playwright E2Eテスト型設定追加

issue_number: 671

## 1. メタ情報

| 項目           | 内容                                  |
| -------------- | ------------------------------------- |
| タスクID       | task-imp-vitest-e2e-config-001        |
| タスク名       | Vitest+Playwright E2Eテスト型設定追加 |
| 優先度         | Low                                   |
| 発見元         | TASK-8C-C Phase 10（最終レビュー）    |
| 発見日         | 2026-02-02                            |
| 対象モジュール | E2Eテスト設定                         |

---

## 2. 概要（Why）

### 2.1 背景

TASK-8C-CのE2Eテストファイル（`skillImportExecution.e2e.ts`）は、Vitest形式（`describe`, `it`, `expect`）で記述されているが、PlaywrightのLocatorメソッド（`toBeVisible`, `toContainText`）を使用している。現在の設定では型チェック時にエラーが発生する。

### 2.2 問題点

| 問題                                              | 影響                               |
| ------------------------------------------------- | ---------------------------------- |
| Vitest `expect` と Playwright `expect` の型不整合 | TypeScript型チェックエラー（16件） |
| `@vitest/playwright` 型拡張が未設定               | IDE補完・型安全性の低下            |

### 2.3 根本原因

既存のE2Eテストは`e2e/`ディレクトリで`@playwright/test`形式を使用しているが、新規テストはVitest形式で`src/__tests__/`に配置された。これにより型定義の不整合が発生。

---

## 3. 目的（What）

### 3.1 達成目標

| 目標                    | 内容                                       |
| ----------------------- | ------------------------------------------ |
| 型チェックエラーの解消  | `pnpm typecheck` でエラー0件               |
| E2Eテスト用の型拡張設定 | Playwright Locatorメソッドの型を正しく認識 |
| 開発者体験の向上        | IDEでの型補完・エラー検出が正常動作        |

### 3.2 スコープ

| スコープ内                      | スコープ外                     |
| ------------------------------- | ------------------------------ |
| vitest.e2e.config.ts 新規作成   | テストロジック自体の修正       |
| tsconfig への E2E設定追加       | 既存 e2e/ ディレクトリの変更   |
| `@vitest/playwright` 型拡張設定 | テストの移動・リファクタリング |

### 3.3 成果物

| 成果物                  | パス                                |
| ----------------------- | ----------------------------------- |
| E2E設定ファイル（新規） | `apps/desktop/vitest.e2e.config.ts` |
| tsconfig更新（必要時）  | `apps/desktop/tsconfig.json`        |

---

## 4. 実装手順（How）

### 4.1 Step 1: vitest.e2e.config.ts 作成

新規ファイル `apps/desktop/vitest.e2e.config.ts` を作成し、以下の設定を含める:

| 設定項目                | 値                                            |
| ----------------------- | --------------------------------------------- |
| test.include            | `['src/__tests__/**/*.e2e.ts']`               |
| test.environment        | `'node'` または `'jsdom'`（Playwright連携用） |
| test.globals            | `true`（describe/it/expectをグローバル利用）  |
| test.typecheck.tsconfig | E2E用のtsconfig参照                           |

### 4.2 Step 2: 型拡張設定

`@vitest/playwright` または手動型拡張で、Playwright Locator の以下のメソッドを Vitest Assertion に追加:

| メソッド          | 用途                     |
| ----------------- | ------------------------ |
| `toBeVisible()`   | 要素の可視性チェック     |
| `toContainText()` | テキスト内容チェック     |
| `toHaveText()`    | 完全一致テキストチェック |
| `toBeEnabled()`   | 要素の有効状態チェック   |

### 4.3 Step 3: tsconfig.json 更新

必要に応じて E2E テスト用の tsconfig 参照パスを追加。

### 4.4 Step 4: 型チェック検証

`pnpm --filter @repo/desktop typecheck` でエラー0件を確認。

---

## 5. 関連タスク

| タスクID  | 関連性                          | 状態   |
| --------- | ------------------------------- | ------ |
| TASK-8C-C | E2Eテスト実装（本タスク発見元） | 完了   |
| TASK-8C-B | E2Eテスト - スキル選択          | 未着手 |
| TASK-8C-D | E2Eテスト - 権限ダイアログ      | 未着手 |

---

## 6. 検証方法

| #   | 検証項目                                | 期待結果         |
| --- | --------------------------------------- | ---------------- |
| 1   | `pnpm --filter @repo/desktop typecheck` | エラー0件        |
| 2   | `pnpm --filter @repo/desktop test:e2e`  | 全テストPASS     |
| 3   | VSCode でテストファイルを開く           | 型エラー表示なし |
| 4   | `.toBeVisible()` などのメソッド補完     | 正常に候補表示   |

---

## 7. リスクと対策

| リスク                             | 対策                                  |
| ---------------------------------- | ------------------------------------- |
| 既存ユニットテストへの影響         | E2E設定を別ファイルに分離し影響を限定 |
| Vitest/Playwright バージョン不整合 | package.json のバージョン確認・固定   |
| 複数の vitest.config.ts による混乱 | 命名規則を明確化（\*.e2e.config.ts）  |

---

## 8. システム仕様書参照

| 参照先                  | 内容                   |
| ----------------------- | ---------------------- |
| quality-requirements.md | テスト環境設定パターン |
| quality-e2e-testing.md  | E2Eテスト仕様          |
| technology-frontend.md  | Vitest 設定            |

---

## 9. 備考

- テストロジック自体に問題はなく、実行環境が整えば動作可能
- ビルド後のテスト実行には影響しない（ランタイム動作は正常）
- 開発時の型チェックの利便性向上のための対応
- 優先度Lowのため、他の高優先度タスク完了後に実施推奨
