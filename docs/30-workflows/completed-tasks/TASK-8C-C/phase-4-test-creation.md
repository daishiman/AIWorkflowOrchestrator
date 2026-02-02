# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 4                            |
| 機能名 | TASK-8C-C-e2e-import-execute |
| 作成日 | 2026-02-02                   |

## 目的

E2Eテストファイルを作成し、6件のテストケースを実装する。このフェーズではテストが失敗状態（Red）であることを確認する。

## 実行タスク

- テストファイル作成: `skillImportExecution.e2e.ts` の作成
- テストケース実装: 6件のE2Eテストケースの実装
- フィクスチャ連携: TASK-8C-Eフィクスチャの参照設定

## 参照資料

| 資料名         | パス                                                                                | 説明          |
| -------------- | ----------------------------------------------------------------------------------- | ------------- |
| 設計書         | `outputs/phase-2/architecture-design.md`                                            | Phase 2成果物 |
| セレクタ設計   | `outputs/phase-2/selector-design.md`                                                | UIセレクタ    |
| レビュー結果   | `outputs/phase-3/design-review-result.md`                                           | Phase 3成果物 |
| 元タスク仕様書 | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-c-e2e-import-execute.md` | 実装例        |

## 実行手順

### ステップ1: テストファイル作成

**ファイルパス**: `apps/desktop/src/__tests__/skillImportExecution.e2e.ts`

**基本構造**:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import path from "path";
```

### ステップ2: セットアップ・ティアダウン実装

| ライフサイクル | 処理内容                     |
| -------------- | ---------------------------- |
| beforeAll      | Electronアプリ起動、Page取得 |
| afterAll       | Electronアプリ終了           |
| beforeEach     | スキル状態リセット           |

**環境変数設定**:

| 変数名          | 値                                            |
| --------------- | --------------------------------------------- |
| NODE_ENV        | `test`                                        |
| TEST_SKILLS_DIR | `path.join(__dirname, "__fixtures__/skills")` |

### ステップ3: インポートフローテストケース実装

**TC-1: インポートダイアログ表示**

| 操作                       | 期待結果                   |
| -------------------------- | -------------------------- |
| スキル選択ボタンをクリック | ドロップダウンが開く       |
| インポートボタンをクリック | -                          |
| -                          | インポートダイアログが表示 |

**TC-2: スキル詳細表示**

| 操作                       | 期待結果                   |
| -------------------------- | -------------------------- |
| インポートダイアログを表示 | -                          |
| -                          | 「許可ツール」が表示       |
| -                          | 「サブエージェント」が表示 |

**TC-3: インポート実行**

| 操作                           | 期待結果                 |
| ------------------------------ | ------------------------ |
| インポートダイアログを表示     | -                        |
| 「インポート」ボタンをクリック | -                        |
| -                              | ダイアログが閉じる       |
| スキル選択ボタンをクリック     | -                        |
| -                              | 「インポート済み」が表示 |

### ステップ4: 実行フローテストケース実装

**TC-4: ストリーミング表示**

| 操作                               | 期待結果                   |
| ---------------------------------- | -------------------------- |
| beforeEach: test-skillをインポート | -                          |
| スキルを選択                       | -                          |
| プロンプト入力・Enter              | -                          |
| -                                  | ストリーミングビューが表示 |

**TC-5: 停止ボタン表示**

| 操作             | 期待結果             |
| ---------------- | -------------------- |
| スキルを実行開始 | -                    |
| -                | 「停止」ボタンが表示 |

**TC-6: 実行中止**

| 操作                     | 期待結果             |
| ------------------------ | -------------------- |
| スキルを実行開始         | -                    |
| 「停止」ボタンをクリック | -                    |
| -                        | 「キャンセル」が表示 |

## 統合テスト連携【必須】

| シナリオカテゴリ | 検証内容                                 | テストファイル              |
| ---------------- | ---------------------------------------- | --------------------------- |
| UI操作テスト     | ボタンクリック・入力・画面遷移           | skillImportExecution.e2e.ts |
| IPC連携テスト    | skill:import, skill:execute, skill:abort | skillImportExecution.e2e.ts |
| 状態遷移テスト   | isExecuting, executionStatus変化         | skillImportExecution.e2e.ts |

## アーキテクチャ層別テスト

| 層                | テスト観点                       |
| ----------------- | -------------------------------- |
| E2E（Playwright） | Electronアプリ全体の動作検証     |
| UI層              | セレクタによる要素操作・表示確認 |
| IPC層             | page.evaluate経由でのAPI呼び出し |

## 成果物

| 成果物            | パス                                                     | 説明         |
| ----------------- | -------------------------------------------------------- | ------------ |
| E2Eテストファイル | `apps/desktop/src/__tests__/skillImportExecution.e2e.ts` | テストコード |
| テスト仕様書      | `outputs/phase-4/test-specification.md`                  | テスト設計   |
| テストケース一覧  | `outputs/phase-4/test-cases.md`                          | ケース一覧   |

## 完了条件

- [ ] `skillImportExecution.e2e.ts` が作成されている
- [ ] 6件のテストケースが実装されている
- [ ] beforeAll/afterAll/beforeEachが設定されている
- [ ] フィクスチャ連携（TEST_SKILLS_DIR）が設定されている
- [ ] すべてのテストが失敗状態（Red）または実行可能状態
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:e2e skillImportExecution

# 確認項目
# - [ ] テストファイルが認識される
# - [ ] テストが実行される（実装未完了のため失敗はOK）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
