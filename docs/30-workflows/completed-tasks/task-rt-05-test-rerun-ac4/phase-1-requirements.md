# Phase 1: 要件定義

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 1                         |
| 機能名     | task-rt-05-test-rerun-ac4 |
| 前提       | なし                      |
| 後続       | Phase 2                   |
| ステータス | 未実施                    |
| 作成日     | 2026-03-31                |

## 目的

TASK-RT-05-TEST-RERUN のスコープ・受入条件・対象テストファイルを固定し、環境ブロック解消後に何を確認すべきかを明確にする。

## 背景

TASK-RT-05（multi_select-user-input-kind）の実装（shared type拡張・engine validation・renderer input surface）は Phase 5 完了済み。しかし esbuild darwin-arm64/darwin-x64 platform mismatch により Vitest が起動せず、本タスク側の Phase 9（品質保証）と Phase 10（最終レビュー）が環境ブロックで未完了のまま残っている。

UT-RT-06 で esbuild 環境修正が施されたため、クリーンな環境での再実行が可能になった。本タスクは「品質保証の再実行」と「最終レビュー反映」のみに限定し、新規実装は行わない。

## 実行タスク

### タスク1: 対象テストファイルの存在確認

**目的**: テスト再実行に必要なファイルが存在することを確認する

**実行手順**:

1. Engine テストファイルの存在確認
   ```bash
   ls apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
   ```
2. Renderer テストファイルの存在確認
   ```bash
   ls apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
   ```
3. 親タスク TASK-RT-05 の phase-9/phase-10 ドキュメントのパス確認
   ```bash
   ls docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-9/
   ls docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-10/
   ```

**期待される成果物**:

- 対象ファイル 3 件の存在確認結果

### タスク2: AC の固定

**目的**: 本タスクで確認すべき受入条件を固定する

**受入条件**:

| AC   | 内容                                                               | 確認方法                                                 |
| ---- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| AC-1 | Engine テスト 4 件以上 PASS                                        | `vitest run SkillCreatorWorkflowEngine.test.ts`          |
| AC-2 | Renderer テスト 5 件以上 PASS                                      | `vitest run SkillLifecyclePanel.llm-generation.test.tsx` |
| AC-3 | 既存 4 kind（single_select/free_text/secret/confirm）回帰 PASS     | Phase 6 の grep 確認 + テスト結果                        |
| AC-4 | phase-9/quality-report.md が「PASS」状態に更新されている           | ファイル内容確認                                         |
| AC-5 | phase-10/final-review-result.md の AC-4 が「PASS」に更新されている | ファイル内容確認                                         |

### タスク3: タスク分類の確定

**目的**: タスク種別を確定し、Phase 11 の NON_VISUAL 判定を記録する

| 属性       | 値                      |
| ---------- | ----------------------- |
| タスク種別 | testing / doc-update    |
| UI task    | No（docs-only task）    |
| 新規実装   | No                      |
| Phase 11   | NON_VISUAL（docs-only） |

## 参照資料

| 資料名             | パス                                                                                                                 | 内容                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 元の未タスク指示書 | `docs/30-workflows/unassigned-task/task-rt-05-test-rerun-ac4.md`                                                     | Phase 構成・苦戦箇所      |
| 親タスク index     | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/index.md`                     | TASK-RT-05 の AC と scope |
| Phase 9 仕様       | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-9-quality-assurance.md` | 更新対象の仕様書          |
| Phase 10 仕様      | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-10-final-review.md`     | 更新対象の仕様書          |

## 成果物

| 成果物       | パス                                  | 内容                            |
| ------------ | ------------------------------------- | ------------------------------- |
| 要件定義書   | `phase-1-requirements.md`             | スコープ・AC・タスク分類の固定  |
| スコープ定義 | `outputs/phase-1/scope-definition.md` | ファイル存在確認結果・AC マップ |

## 統合テスト連携

- Phase 4 でこの AC マップを使い既存テストの対応確認を行う
- Phase 7 で AC ごとのカバレッジ matrix を作成する根拠とする

## 完了条件

- [ ] 対象テストファイル 2 件の存在が確認されている
- [ ] 親タスクの phase-9 / phase-10 ドキュメントのパスが確認されている
- [ ] AC-1〜AC-5 の定義が記録されている
- [ ] タスク分類（docs-only / NON_VISUAL）が確定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- `outputs/phase-1/scope-definition.md` を作成し、ファイル存在確認結果と AC マップを記録する
- `artifacts.json` の Phase 1 ステータスを `completed` に更新する
