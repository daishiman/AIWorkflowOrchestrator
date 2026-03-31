# step-11-par-task-plan-execution-hardening

## 概要

TASK-P0-07 と TASK-SDK-04-U2 を統合した並列タスクバンドル。
どちらも `plan/execute` の堅牢化を目的とするが、責務は独立しているため、設計確定後は main-process 系と renderer 系を並列で進められる。

- **TASK-P0-07**: `RuntimeSkillCreatorFacade.plan()` の fallback path が `PLAN_RESOURCE_REQUESTS` から agent 名を導出するようにし、`planPromptConstants.ts` の `AGENT_NAMES` ハードコードを削除する
- **TASK-SDK-04-U2**: `SkillLifecyclePanel.tsx` の plan 承認スナップショットを mutable textarea から切り離し、execute 時に live draft ではなく承認済み snapshot を使う

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-P0-07 + TASK-SDK-04-U2     |
| タスク種別 | リファクタリング / バグ修正     |
| 優先度     | P0 (High)                       |
| ステータス | spec_created                    |
| 上流ゲート | Phase 1-2 の current facts 固定 |
| 依存タスク | TASK-SDK-04                     |
| 後続タスク | なし                            |
| 作成日     | 2026-03-31                      |
| 更新日     | 2026-03-31                      |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | 2 つの独立した drift を解消すること。1 つは runtime の agent 名重複、もう 1 つは renderer の承認済み snapshot 逸脱 |
| 依存関係・責務境界   | P0-07 は main-process / runtime orchestration、U2 は renderer state の責務。共通化しすぎず分離する                 |
| 価値とコストの不均衡 | 既存の source of truth を再利用すれば、追加レイヤーを増やさずに高い保守性を得られる                                |
| 改善優先順位         | 1. source of truth の一本化 2. snapshot semantics の固定 3. テストで drift 再発を封じる                            |
| 4条件評価            | 価値性: 高 / 実現性: 高 / 整合性: 高 / 運用性: 高                                                                  |

## 受入基準

### TASK-P0-07

| ID      | 基準                                                                                                     |
| ------- | -------------------------------------------------------------------------------------------------------- |
| P7-AC-1 | `PLAN_PROMPT_CONSTANTS.AGENT_NAMES` が削除され、agent 名は `PLAN_RESOURCE_REQUESTS` から導出されている   |
| P7-AC-2 | `RuntimeSkillCreatorFacade.plan()` の fallback path が agent resource request を順番に読み込む           |
| P7-AC-3 | `PLAN_RESOURCE_REQUESTS` の内容が変われば default fallback もそれに追随している                          |
| P7-AC-4 | `RuntimeSkillCreatorFacade.plan()` の system prompt に含まれる agent 仕様が current facts と一致している |
| P7-AC-5 | 既存テストが pass する（後方互換性維持）                                                                 |
| P7-AC-6 | agent 名導出と fallback path の 2 パターンがユニットテストで網羅されている                               |

### TASK-SDK-04-U2

| ID      | 基準                                                                                            |
| ------- | ----------------------------------------------------------------------------------------------- |
| S4-AC-1 | `SkillLifecyclePanel.tsx` が plan 承認時点の request snapshot を `approvedSkillSpec` に保持する |
| S4-AC-2 | plan review 後に textarea を編集しても execute 対象は変わらない                                 |
| S4-AC-3 | `approvedSkillSpec` は cancel か再生成まで不変である                                            |
| S4-AC-4 | generate → edit → execute の drift 再現テストで、live draft が execute payload に流れない       |

## スコープ

**含む**:

- `RuntimeSkillCreatorFacade.ts` の fallback path で使う agent 名導出の整理
- `planPromptConstants.ts` からの `AGENT_NAMES` 削除
- `SkillLifecyclePanel.tsx` の snapshot semantics 明確化
- `RuntimeSkillCreatorFacade.plan.test.ts` と `SkillLifecyclePanel.llm-generation.test.tsx` の更新
- `plan/execute` の dataflow を current facts に合わせて整合させること

**含まない**:

- IPC contract の形状変更
- runtime / renderer 以外の責務再編
- commit、PR 作成、push（Phase 13 で user approval があるまで実行しない）

## 依存関係

| 種別      | 参照先                                                                | 役割                                  |
| --------- | --------------------------------------------------------------------- | ------------------------------------- |
| upstream  | TASK-SDK-04                                                           | renderer plan/execute bridge の前提   |
| canonical | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | P0-07 の current code anchor          |
| canonical | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | U2 の current code anchor             |
| canonical | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | P0-07 の source of truth              |
| canonical | `.claude/skills/task-specification-creator/SKILL.md`                  | Phase 1-13 / Phase 12 template の正本 |
| canonical | `.claude/skills/aiworkflow-requirements/SKILL.md`                     | system spec の正本                    |

## 30思考法の適用方針

30種の思考法は Phase 1-3 に集約し、以降の Phase はその結論のみを消費する。

| カテゴリ     | 思考法                                                                    | 主な適用フェーズ     | 目的                                     |
| ------------ | ------------------------------------------------------------------------- | -------------------- | ---------------------------------------- |
| 論理分析系   | 批判的思考 / 演繹思考 / 帰納的思考 / アブダクション / 垂直思考            | Phase 1 / 3 / 9      | 矛盾検出と結論の妥当性確認               |
| 構造分解系   | 要素分解 / MECE / 2軸思考 / プロセス思考                                  | Phase 1 / 2 / 5      | 検証項目と変更対象を漏れなく分解する     |
| メタ・抽象系 | メタ思考 / 抽象化思考 / ダブル・ループ思考                                | Phase 1 / 3 / 12     | 前提を見直し、不要な層を増やさない       |
| 発想・拡張系 | ブレインストーミング / 水平思考 / 逆説思考 / 類推思考 / if思考 / 素人思考 | Phase 2 / 4 / 5      | 代替案を広く出し、最小複雑性へ収束させる |
| システム系   | システム思考 / 因果関係分析 / 因果ループ                                  | Phase 2 / 5 / 7      | 依存関係と波及効果を閉じる               |
| 戦略・価値系 | トレードオン思考 / プラスサム思考 / 価値提案思考 / 戦略的思考             | Phase 1 / 2 / 10     | 価値最大化とコスト最小化を両立する       |
| 問題解決系   | why思考 / 改善思考 / 仮説思考 / 論点思考 / KJ法                           | Phase 1 / 3 / 4 / 12 | 真の論点を固定し、改善案を束ねる         |

## オーケストレーション

| Lane / SubAgent | 責務                                                                      | 実行形態                           | 完了条件                                           |
| --------------- | ------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------- |
| Lane A          | `RuntimeSkillCreatorFacade.ts` / `planPromptConstants.ts` / runtime tests | Phase 1-5 の main-process 系で直列 | `PLAN_RESOURCE_REQUESTS` を source of truth に固定 |
| Lane B          | `SkillLifecyclePanel.tsx` / `SkillLifecyclePanel.llm-generation.test.tsx` | Phase 1-5 の renderer 系で直列     | request snapshot semantics の固定                  |
| Lane C          | Phase 12 documentation wave                                               | A/B 完了後に直列                   | implementation guide と spec sync の整合           |
| Lane D          | 最終検証                                                                  | C 完了後に直列                     | grep / test / typecheck / diff の pass             |

### 並列実行ルール

- Lane A と Lane B は、Phase 2 で設計が固まった後に並列実装できる。
- A/B は別ファイルを変更するため、Phase 2 の設計確定後はそのまま並列で進められる。
- Phase 12 は A/B の結果を消費するだけにし、A/B と同時に走らせない。

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)

## ディレクトリ構成

```text
step-11-par-task-plan-execution-hardening/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
└── phase-13-pr-creation.md
```

## 実装者向けクイックガイド

### 着手条件

- `RuntimeSkillCreatorFacade.ts` の `PLAN_RESOURCE_REQUESTS` と `approvedSkillSpec` の関係を読了している
- `SkillLifecyclePanel.tsx` の `handleGeneratePlan` / `handleExecutePlan` / `approvedSkillSpec` の関係を把握している
- 2 つのタスクは独立ファイルを変更するため、設計確定後は並列で着手できる

### 想定変更ポイント

- `apps/desktop/src/main/services/runtime/planPromptConstants.ts` — `AGENT_NAMES` を削除し、`PLAN_RESOURCE_REQUESTS` から default agent 名を導出する
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — fallback path を `PLAN_RESOURCE_REQUESTS` ベースへ整理
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` — agent 導出のテストを更新
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — approved snapshot semantics を request snapshot として明示
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` — drift 防止テストを維持・強化

### 非対象

- UI の再設計
- runtime / renderer 以外の責務再編
- commit / PR / push

### 完了イメージ

- `AGENT_NAMES` のハードコードが消え、agent 名は `PLAN_RESOURCE_REQUESTS` から導かれる
- plan 承認後に textarea を編集しても execute payload は変わらない
- 既存テストと新規 drift 防止テストがともに pass する

### 並列実行メモ

- Phase 2 の設計確定後、Lane A と Lane B は並列で進められる
- Phase 12 は A/B の検証結果を受けてから実施する
- Phase 13 は user approval がない限り blocked のまま維持する
