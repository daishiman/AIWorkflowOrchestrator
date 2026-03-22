# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 13                                                 |
| Phase 名   | PR作成                                             |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 |
| 前提 Phase | Phase 12                                           |
| 後続 Phase | なし                                               |
| ステータス | not_started                                        |
| 作成日     | 2026-03-19                                         |
| 機能名     | settings-shell-access-matrix-mainline              |

## 目的

Settings / App shell mainline access matrix の PR 準備条件を整理する。ユーザー指示なしに PR は作成しない。

## 実行タスク

- PR blocked 条件確認: ユーザー指示なしに PR を作成しない前提を明記する
- CI / review 準備: 将来の PR に必要な evidence bundle を整理する
- handover: レビュー担当が見るべき docs / evidence / risk を整理する

## 参照資料

| 参照資料               | パス                                                                                                                                       | 内容                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 親パック index         | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                                 | 依存順・並列可否・設計ゲート                      |
| Task index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-03-settings-shell-access-matrix-mainline/index.md | 対象 task のメタ情報と受入基準                    |
| Phase 1                | phase-1-requirements.md                                                                                                                    | 要件定義の確定内容                                |
| Phase 2                | phase-2-design.md                                                                                                                          | 設計内容と validation matrix                      |
| Phase 3                | phase-3-design-review.md                                                                                                                   | review gate の判定                                |
| Phase 4                | phase-4-test-creation.md                                                                                                                   | Phase 4（テスト作成）の仕様書                     |
| Phase 5                | phase-5-implementation.md                                                                                                                  | Phase 5（実装）の仕様書                           |
| Phase 6                | phase-6-test-expansion.md                                                                                                                  | Phase 6（テスト拡充）の仕様書                     |
| Phase 7                | phase-7-coverage-check.md                                                                                                                  | Phase 7（カバレッジ確認）の仕様書                 |
| Phase 8                | phase-8-refactoring.md                                                                                                                     | Phase 8（リファクタリング）の仕様書               |
| Phase 9                | phase-9-quality-assurance.md                                                                                                               | Phase 9（品質検証）の仕様書                       |
| Phase 10               | phase-10-final-review.md                                                                                                                   | Phase 10（最終レビュー）の仕様書                  |
| Phase 11               | phase-11-manual-test.md                                                                                                                    | Phase 11（手動テスト）の仕様書                    |
| Phase 12               | phase-12-documentation.md                                                                                                                  | Phase 12（ドキュメント）の仕様書                  |
| 旧canonical workflow   | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                                              | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                                                     | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                                                        | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                                                   | 矛盾・依存・漏れの監査軸                          |
| workflow 正本          | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md                              | runtime 責務再配線の current canonical            |
| resource map           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                                             | 必要仕様の初動選定                                |
| quick reference        | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                                                          | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth        | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                                                       | auth/access 契約の親入口                          |
| api-ipc-system         | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                                                        | system IPC 契約の親入口                           |
| arch-state-management  | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                                                 | Renderer 責務境界の親入口                         |
| Task02 index           | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md                                               | 共有 policy の消費契約                            |
| ui-ux-settings         | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md                                                                        | Settings 正本の親入口                             |
| ui-ux-settings-core    | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                                                   | Settings IA / bypass / screenshot 契約            |
| ui-ux-navigation       | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                                                      | settings 公開導線・nav 契約                       |
| llm-ipc-types          | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                                                         | health row の型契約                               |

## 実行手順

### ステップ1: Blocked 条件の確認

以下の3つの blocked 条件を順番に確認し、全てクリアされていない場合は PR 準備を開始しない:

1. **BLOCKED-PR-1**: ユーザーから commit/PR 作成の明示的な指示があること（指示なしに commit/PR 作成しない）
2. **BLOCKED-PR-2**: Phase 12 の全成果物が完成していること（`outputs/phase-12/` 配下の全ファイルが存在し、phase12-task-spec-compliance-check.md の全項目が PASS であること）
3. **BLOCKED-PR-3（推奨）**: Task02（Runtime Policy Centralization）の Phase 13 approval が完了していること（未完了でも進行可能だが、依存関係の観点から推奨）

blocked 条件のステータスを `outputs/phase-13/pr-preparation.md` の冒頭に記録する。

### ステップ2: PR Evidence Bundle の整理

将来の PR 作成に備え、以下の evidence を整理する:

1. **設計成果物サマリー**: Phase 1〜12 の主要成果物パスとその内容を一覧化する
2. **AC 照合結果**: Phase 10 の `final-review-report.md` から AC-1〜AC-4 の判定結果を転記する
3. **品質検証結果**: Phase 9 の `quality-checklist.md` から RG-01〜RG-06 の判定結果を転記する
4. **リスク残存状況**: Phase 9 の `risk-register.md` から未緩和リスクを転記する
5. **未タスク一覧**: Phase 12 の `unassigned-task-detection.md` から検出件数と概要を転記する

### ステップ3: PR タイトル・本文の下書き作成

1. **ブランチ名候補**: `docs/settings-shell-access-matrix-mainline-design` を記録する
2. **PR タイトル候補**（70文字以内）: `docs(settings): Settings shell access matrix mainline design` を記録する
3. **PR 本文下書き**:
   - Summary（1-3箇条書き）: 3 Concern の設計内容を簡潔にまとめる
   - Test Plan: 設計タスクのためコードテストなし。Phase 9 品質チェックリスト + Phase 11 手動テスト計画を参照
   - Evidence: Phase 10 final-gate-decision.md のリンク
   - Risk: 未緩和リスクの要約
4. **レビュー担当向けガイド**: レビュー時に確認すべきドキュメント一覧と確認観点を記述する

### ステップ4: Handover 情報の整理と PR 準備メモの確定

1. `outputs/phase-13/pr-preparation.md` を作成し、以下を含める:
   - Blocked 条件のステータス（ステップ1の結果）
   - Evidence Bundle の一覧（ステップ2の結果）
   - PR タイトル・本文の下書き（ステップ3の結果）
   - レビュー担当が見るべき docs / evidence / risk の優先順位
2. ユーザーへの最終確認事項を明記する:
   - commit/PR 作成の指示待ち状態であること
   - Task02 Phase 13 との統合 PR が望ましいか個別 PR とするかの判断待ちであること
3. 全 Phase（1〜13）の成果物が `outputs/` 配下に揃っていることを最終確認する

## 統合テスト連携（Phase 1〜11は必須）

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: Settings / AppLayout / public unauthenticated shell に capability cards / health row / terminal launcher を実装する設計を固める

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物     | パス                               | 内容                               |
| ---------- | ---------------------------------- | ---------------------------------- |
| PR準備メモ | outputs/phase-13/pr-preparation.md | PR 作成前の確認項目と blocked 条件 |

## 完了条件

- [ ] PR blocked 条件が明記されている
- [ ] future PR 用の handover 情報が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-13/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- なし（ユーザー指示待ち）
