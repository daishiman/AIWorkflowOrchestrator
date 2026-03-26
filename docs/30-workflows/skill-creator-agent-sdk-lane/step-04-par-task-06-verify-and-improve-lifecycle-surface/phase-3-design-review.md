# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 3                                    |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

Phase 1 と Phase 2 の設計が Task05 / Task07 / Task08 と衝突せず、Phase 4 の test creation へ進める粒度まで閉じているか判定する。

## 実行タスク

- owner 境界と panel topology をレビューする
- public IPC / preload / shared type の drift 可能性をレビューする
- delegated item を確定する
- Phase 4 の検証 focus を固定する

## 参照資料

| 資料名            | パス                                               | 説明              |
| ----------------- | -------------------------------------------------- | ----------------- |
| Phase 1 要件      | `phase-1-requirements.md`                          | AC と scope       |
| Phase 2 設計      | `phase-2-design.md`                                | topology と DTO   |
| surface matrix    | `outputs/phase-2/verify-improve-surface-matrix.md` | concern 分離      |
| validation matrix | `outputs/phase-2/validation-matrix.md`             | test focus の原本 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                                    | 内容                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Runtime public IPC 契約 | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                              | public surface との整合           |
| scoring gate workflow   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md` | detail surface の既存パターン整合 |

## 実行手順

### ステップ1: owner boundary を判定する

- renderer が verify truth を持っていないか確認する
- Task02 の `verifyResult` owner を崩す設計がないか確認する
- Task05 の navigation owner を Task06 が横取りしていないか確認する

### ステップ2: public contract drift を判定する

- `creatorHandlers.ts` / `skill-creator-api.ts` / `packages/shared/src/types/skillCreator.ts` の 3 層が同じ DTO を参照できるか確認する
- `RuntimeSkillCreatorImproveSuggestion` と `ApplyImprovementResult` を再定義していないか確認する

### ステップ3: delegated item を固定する

- create entry の最終遷移設計は Task05 に残す
- approval / disclosure / manual boundary の hardening は Task07 に残す
- persistence / resume compatibility は Task08 に残す

## 統合テスト連携

- Phase 4 の `outputs/phase-4/test-matrix.md` に `verify detail`, `apply result`, `re-verify`, `handoff guidance` の 4 観点を入れる
- shared type / main IPC / preload API / renderer panel の 4 層を同じ test suite で追える構成にする

## 4条件レビュー

| 条件   | 判定観点                                                                  |
| ------ | ------------------------------------------------------------------------- |
| 価値性 | result surface の欠落を埋め、実装者の判断コストを下げる設計になっているか |
| 実現性 | Layer 1 / 2 verify と panel wiring の範囲に収まっているか                 |
| 整合性 | Task02-04 の owner / bridge と矛盾していないか                            |
| 運用性 | Phase 9 / 10 / 12 で検証と同期を回せる構成か                              |

## 成果物

| 成果物             | パス                                                      | 説明                                     |
| ------------------ | --------------------------------------------------------- | ---------------------------------------- |
| 設計レビュー       | `phase-3-design-review.md`                                | gate 判定                                |
| design review gate | `outputs/phase-3/design-review-gate.md`                   | blocker / delegated / Phase 4 focus      |
| compliance review  | `outputs/phase-3/skill-compliance-and-elegance-review.md` | 2 skill 準拠と 30 思考法による簡潔性監査 |

## 完了条件

- [ ] blocker が 0 件である
- [ ] delegated item が Task05 / Task07 / Task08 へ割り当て済みである
- [ ] Phase 4 focus が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 4 で DTO / IPC / panel flow の test matrix を作成する。
