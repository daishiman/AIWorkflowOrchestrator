# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| タスクID   | TASK-SW-CANCEL-002               |
| 機能名     | skill-creator-cancel-preload-api |
| 前提Phase  | -                                |
| 後続Phase  | Phase 2                          |
| 作成日     | 2026-04-15                       |
| ステータス | completed                        |

## 目的

Preload 層の cancel API 追加対象を固定し、`TASK-SW-CANCEL-001` から受け取る shared channel 定数と
本タスクの責務境界を明確にする。

## 実行タスク

- 対象コード確認: `skill-creator-api.ts` と `channels.ts` の current facts を確認
- 受け入れ基準固定: AC-1〜AC-4 を workflow 全体の単一基準として採用
- タスク分類宣言: バグ修正 / NON_VISUAL / preload contract task
- スコープ境界確認: Main ハンドラーと Renderer hook は後続 task に分離

## 参照資料

| 資料                    | パス                                                                                            | 用途                     |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ------------------------ |
| requirements-definition | `outputs/phase-1/requirements-definition.md`                                                    | 詳細要件の保存先         |
| acceptance-criteria     | `outputs/phase-1/acceptance-criteria.md`                                                        | AC の詳細                |
| cancel chain lessons    | `.agents/skills/aiworkflow-requirements/references/lessons-learned-skill-cancel-abortsignal.md` | cancel chain 境界の確認  |
| skill creator IPC spec  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md`             | 正本仕様の current facts |

## 実行手順

1. `packages/shared/src/ipc/channels.ts` 側の `SKILL_CREATOR_CANCEL` 追加済み事実を前提化する
2. `apps/desktop/src/preload/skill-creator-api.ts` に `cancelGeneration` が存在することを確認する
3. `apps/desktop/src/preload/channels.ts` に allowlist 登録があることを確認する
4. Main/Renderer は本 task のスコープ外として明示する

## 統合テスト連携

- 本 task 自体は preload 差分だが、shared / main / renderer 側の cancel chain テスト群を参照して統合上の矛盾がないことを確認対象に含める

## 成果物

| 成果物       | パス                                         |
| ------------ | -------------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     |

## 完了条件

- [x] AC-1〜AC-4 を固定した
- [x] preload 2ファイルが変更対象であることを固定した
- [x] 後続 task との責務境界を明示した
- [x] 本 Phase 内の全タスクを100%実行完了
