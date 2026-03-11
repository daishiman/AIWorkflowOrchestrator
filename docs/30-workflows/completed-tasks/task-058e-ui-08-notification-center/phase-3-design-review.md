# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 3                                   |
| 機能名 | task-058e-ui-08-notification-center |
| 作成日 | 2026-03-11                          |
| ゲート | Group A 完了判定                    |

## 目的

Phase 1 と Phase 2 が 058e 正本、056c 既存契約、現行 P50 実体の三者を矛盾なく接続できているかを判定する。ここで PASS か MINOR を取れない場合は Phase 4 以降へ進めない。

## 実行タスク

- 要件整合レビュー: FR / NFR が task-058e 原本を欠落なく表現しているか確認する。
- P50差分レビュー: 現行実装との差分が Phase 5 の実装単位へ落ちているか確認する。
- IPCレビュー: 既存 channel 再利用と `notification:delete` 追加が破綻していないか確認する。
- a11yレビュー: Portal、Escape、focus trap、`aria-*` が設計に入っているか確認する。
- ゲート判定: PASS / MINOR / MAJOR / CRITICAL と戻り先を記録する。

## 参照資料

| 参照資料               | パス                                                                           | 説明           |
| ---------------------- | ------------------------------------------------------------------------------ | -------------- |
| Phase 1 要件           | `outputs/phase-1/requirements-definition.md`                                   | 基準要件       |
| Phase 1 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`                                       | 判定条件       |
| Phase 1 スコープ       | `outputs/phase-1/scope-definition.md`                                          | 対象範囲       |
| Phase 2 設計           | `outputs/phase-2/architecture-design.md`                                       | 設計全体       |
| Phase 2 component 設計 | `outputs/phase-2/component-design.md`                                          | UI 分割        |
| Phase 2 state / IPC    | `outputs/phase-2/state-ipc-design.md`                                          | 境界設計       |
| review gate 基準       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準       |
| 既存 UI 実体           | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx`  | P50 実体比較   |
| 正本仕様抽出           | `outputs/phase-2/aiworkflow-requirements-extract.md`                           | Phase 2 成果物 |
| SubAgent責務表         | `outputs/phase-1/subagent-ownership.md`                                        | Phase 1 成果物 |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | このPhaseで確認する内容            |
| ------------------ | ------------------------------------------------------------------------------- | ---------------------------------- |
| Feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 056c 契約を壊していないか          |
| State              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | 100件保持、重複排除、selector 粒度 |
| Navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | Bell 導線と label 契約             |
| Portal             | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`    | stacking context と focus          |
| Security           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | sender 検証と公開境界              |
| a11y               | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`    | Escape、dialog、live region        |

## 実行手順

### ステップ1: レビュー観点チェック

| 観点     | チェック項目                                                                  |
| -------- | ----------------------------------------------------------------------------- |
| 仕様整合 | title「お知らせ」、all read、swipe delete、empty state を網羅している         |
| P50差分  | `clear all` UI 除去、相対時刻、component 分割、delete IPC を網羅している      |
| Store    | `notificationSlice` の 056c 契約を維持している                                |
| IPC      | `get-history` / `mark-read` / `mark-all-read` / `new` / `delete` の境界が明確 |
| a11y     | Escape、Tab wrap、`aria-expanded`、`aria-labelledby` が定義されている         |
| テスト   | P39 / P40 / P31 / P5 を Phase 4-7 で検証できる                                |

### ステップ2: 判定基準

| 判定     | 条件                                | 戻り先           |
| -------- | ----------------------------------- | ---------------- |
| PASS     | blocking issue 0 件                 | Phase 4          |
| MINOR    | wording 修正と不足テスト観点のみ    | Phase 4          |
| MAJOR    | UI / IPC / state 境界に欠落がある   | Phase 1 または 2 |
| CRITICAL | 056c 契約破壊か security 欠落がある | Phase 1          |

### ステップ3: P50必須差分の確認

| 差分項目                     | Phase 5 へ渡せる形か |
| ---------------------------- | -------------------- |
| title 統一                   | [ ]                  |
| clear all UI 除去            | [ ]                  |
| swipe delete 導入            | [ ]                  |
| delete IPC 追加              | [ ]                  |
| relative time                | [ ]                  |
| focus trap / Escape / Portal | [ ]                  |

## 統合テスト連携

| 観点       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| UI 接続    | Bell trigger と Portal popover の DOM 配置を検証できる               |
| Store 接続 | history sync と push dedupe の回帰観点を維持する                     |
| IPC 接続   | delete channel 追加で preload / main / renderer の三層整合を確認する |
| 運用接続   | Phase 11 screenshot と Phase 12 spec sync の対象が定義済み           |

## 成果物

| 成果物           | パス                                      | 説明             |
| ---------------- | ----------------------------------------- | ---------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果         |
| 差分解消一覧     | `outputs/phase-3/gap-resolution-list.md`  | P50 差分一覧     |
| ゲート記録       | `outputs/phase-3/review-gate.md`          | 戻り先を含む記録 |

## 完了条件

- [ ] 仕様整合レビューを完了している
- [ ] P50差分レビューを完了している
- [ ] IPC と a11y のレビューを完了している
- [ ] PASS / MINOR / MAJOR / CRITICAL の基準を記録している
- [ ] Phase 4 開始条件を記録している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 要件整合レビュー
2. P50 差分レビュー
3. IPC / a11y レビュー
4. ゲート判定の記録
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-3/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 3 と整合している

## 次のPhase

[Phase 4: テスト作成](./phase-4-test-creation.md)
