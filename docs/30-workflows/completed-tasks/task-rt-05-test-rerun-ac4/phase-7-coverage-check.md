# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 7                         |
| 機能名     | task-rt-05-test-rerun-ac4 |
| 前提Phase  | Phase 6                   |
| 後続Phase  | Phase 9                   |
| ステータス | 未実施                    |
| 作成日     | 2026-03-31                |

## 目的

Phase 4・Phase 6 の確認結果を集約し、AC-1〜AC-5 の各受入条件に対するテスト対応表を作成する。Phase 9 の品質保証前に全 AC がカバーされていることを保証する。

## 実行タスク

### タスク1: AC-coverage matrix の作成

**目的**: 全 AC に対してどのテストが対応するかを明確化する

**Coverage Matrix**:

| AC   | 確認方法                                                             | 対応テスト / 成果物                                       |
| ---- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| AC-1 | Engine テスト 4 件以上が PASS することを Phase 9 で確認              | `SkillCreatorWorkflowEngine.test.ts`（4 件以上）          |
| AC-2 | Renderer テスト 5 件以上が PASS することを Phase 9 で確認            | `SkillLifecyclePanel.llm-generation.test.tsx`（5 件以上） |
| AC-3 | Phase 6 の grep 確認 + Phase 9 の品質保証で確認                      | 両テストファイルの 4 kind テスト                          |
| AC-4 | Phase 9 のテスト結果を基に quality-report.md を更新（Phase 10）      | `outputs/phase-9/quality-report.md` の更新                |
| AC-5 | Phase 9 のテスト結果を基に final-review-result.md を更新（Phase 10） | `outputs/phase-10/final-review-result.md` の更新          |

### タスク2: Phase 9 実行前チェックリスト確認

**目的**: Phase 9 の品質保証に必要な前提が揃っていることを確認する

**チェックリスト**:

- [ ] 環境クリーンアップ完了（Phase 5）
- [ ] esbuild 動作確認済み（Phase 5）
- [ ] Vitest 起動確認済み（Phase 5）
- [ ] 対象テストファイル 2 件の存在確認済み（Phase 1）
- [ ] 既存 4 kind の grep 確認済み（Phase 6）

## 参照資料

| 資料名             | パス                        | 内容               |
| ------------------ | --------------------------- | ------------------ |
| Phase 4 テスト作成 | `phase-4-test-creation.md`  | テストケース数確認 |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md` | 4 kind 確認結果    |
| Phase 1 要件定義   | `phase-1-requirements.md`   | AC 定義            |

## 成果物

| 成果物           | パス                                    | 内容                              |
| ---------------- | --------------------------------------- | --------------------------------- |
| カバレッジ確認書 | `phase-7-coverage-check.md`             | AC-coverage matrix と前提チェック |
| AC カバレッジ表  | `outputs/phase-7/ac-coverage-matrix.md` | 全 AC の対応テスト一覧            |

## 統合テスト連携

- Phase 9 でこの matrix に基づいて品質保証を実行し、結果を埋める
- Phase 10 で AC-4・AC-5 の充足を確認して最終レビューを実施する

## 完了条件

- [ ] AC-1〜AC-5 の全 coverage matrix が作成されている
- [ ] Phase 9 実行前チェックリストの全項目が PASS している
- [ ] Phase 8 が N/A であることが確認されている（既存コード変更なし）
- [ ] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- `outputs/phase-7/ac-coverage-matrix.md` を作成し、AC-coverage matrix を記録する
- `artifacts.json` の Phase 7 ステータスを `completed` に更新する
