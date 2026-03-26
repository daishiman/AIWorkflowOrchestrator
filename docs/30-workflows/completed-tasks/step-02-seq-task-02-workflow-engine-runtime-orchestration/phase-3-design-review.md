# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 3                                     |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

Phase 1 と Phase 2 の設計が、Task03 / Task04 / Task07 / Task08 の前提として使える粒度まで閉じているかを判定する。

## 実行タスク

- ownership matrix の妥当性をレビューする
- public IPC contract と internal workflow state の分離をレビューする
- blocker / minor / delegated item を分類する
- Phase 4 へ渡す test focus を確定する

## 参照資料

| 資料名           | パス                                  | 説明                     |
| ---------------- | ------------------------------------- | ------------------------ |
| Phase 1 要件     | `phase-1-requirements.md`             | owner inventory          |
| Phase 2 設計     | `phase-2-design.md`                   | engine / facade 設計     |
| ownership matrix | `outputs/phase-2/ownership-matrix.md` | review 対象の owner 一覧 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                        |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| Runtime public IPC 契約    | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | facade と public IPC の整合 |
| RuntimePolicyResolver 契約 | `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | lane baseline の整合        |

## 実行手順

### ステップ1: owner 分離の gate を判定する

- workflow state を facade が直接保持していないかを確認する。
- renderer が source of truth 扱いになっていないかを確認する。
- `ManifestLoader` が state owner や route authority に昇格していないかを確認する。

### ステップ2: public contract drift を判定する

- `RuntimeSkillCreatorExecuteResponse` を public contract の正本として扱えているかを確認する。
- `creatorHandlers.ts` と `skill-creator-api.ts` が shared 型を参照できる設計かを確認する。

### ステップ3: delegated item を固定する

- resource selection は Task03、interaction bridge は Task04、governance hardening は Task07、resume compatibility は Task08 へ送る。
- verify surface の詳細は Task06 に送る。

## 統合テスト連携

- Phase 4 の test matrix に `owner separation` / `handoff branch` / `shared contract parity` の 3 観点を必須で入れる。
- `validate-phase-output` と `verify-all-specs` の観点から、Phase 間参照漏れがないかをここで確認する。

## 4条件レビュー

| 条件   | 判定観点                                                               |
| ------ | ---------------------------------------------------------------------- |
| 価値性 | downstream task の再設計コストを実際に下げる owner 分離になっているか  |
| 実現性 | Task02 の scope で閉じる項目と後続 task へ送る項目が混ざっていないか   |
| 整合性 | facade / engine / renderer / loader の責務境界が相互に衝突していないか |
| 運用性 | verify / resume / spec sync の運用導線が後続 task と矛盾していないか   |

## 成果物

| 成果物              | パス                                    | 説明                            |
| ------------------- | --------------------------------------- | ------------------------------- |
| 設計レビュー        | `phase-3-design-review.md`              | gate 判定                       |
| review gate summary | `outputs/phase-3/design-review-gate.md` | PASS / MINOR / delegated の一覧 |

## 完了条件

- [ ] blocker が 0 件である
- [ ] delegated item が Task03 / Task04 / Task06 / Task07 / Task08 へ割り当て済みである
- [ ] Phase 4 へ渡す test focus が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**
