# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 4                                |
| Phase名    | テスト作成                       |
| 前提Phase  | Phase 3                          |
| 後続Phase  | Phase 5                          |
| ステータス | pending                          |
| 作成日     | 2026-03-05                       |
| 機能名     | task-056a-a-store-slice-baseline |

## 目的

Phase 5実装前に、Slice棚卸しと境界判定の妥当性を検証するテスト観点を定義する。

## 実行タスク

- テスト観点定義: Inventory、境界、セレクタ規約の検証観点を作成
- テストケース作成: 正常系・異常系・回帰系のケース化
- 実行計画作成: Phase 5で実行する手順を固定

## 参照資料

| 参照資料           | パス                                                                                        | 内容                 |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1成果物      | `./phase-1-requirements.md`                                                                 | 要件と受け入れ基準   |
| Phase 2成果物      | `./phase-2-design.md`                                                                       | 設計内容             |
| レビュー結果       | `./phase-3-design-review.md`                                                                | テスト入力           |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | セレクタと型検証     |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗時レスポンス基準 |

## 実行手順

### Step 1: テスト分類

- Unit: Slice判定ロジック。
- Integration: `index.ts` セレクタ露出。
- Regression: P31再発防止。

### Step 2: テストケース作成

- 1ケース1期待結果で記述する。
- 失敗時ログ項目を定義する。

### Step 3: 実行順序作成

- Unit → Integration → Regression の順で固定する。
- 失敗時停止条件を定義する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                       |
| ---------------- | ------------------------------ |
| API接続          | IPC変更なしの確認ケースを配置  |
| 認証フロー       | Auth Slice境界維持ケースを配置 |
| データフロー     | Selector参照安定ケースを配置   |

## 成果物

| 成果物       | パス                                    | 内容       |
| ------------ | --------------------------------------- | ---------- |
| テスト仕様   | `outputs/phase-4/test-specification.md` | 観点一覧   |
| テストケース | `outputs/phase-4/test-cases.md`         | ケース定義 |
| 実行計画     | `outputs/phase-4/test-run-plan.md`      | 実行順序   |

## 完了条件

- [ ] Unit/Integration/Regressionの3分類が定義済み
- [ ] テストケースが入力/期待結果付きで記載済み
- [ ] 実行順序と停止条件が記載済み
- [ ] Phase 5で参照するパスが固定済み

## 次のPhase

Phase 5: 実装
