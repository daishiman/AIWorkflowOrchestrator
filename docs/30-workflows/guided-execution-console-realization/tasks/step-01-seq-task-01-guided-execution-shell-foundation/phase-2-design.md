# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 2                                              |
| Phase名    | 設計                                           |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 1                                        |
| 後続Phase  | Phase 3（設計レビュー）                        |
| ステータス | not_started                                    |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

front naming、route、shared launcher、mainline CTA wiring を一つの foundation contract にまとめる。

## 実行タスク

- naming contract 設計
- route contract 設計
- shared action dispatcher 設計
- surface 別 CTA マッピング設計

## 参照資料

| 参照資料        | パス                                                                              | 内容              |
| --------------- | --------------------------------------------------------------------------------- | ----------------- |
| Phase 1         | `phase-1-requirements.md`                                                         | current drift     |
| root UX         | `docs/30-workflows/guided-execution-console-realization/ui-ux-realization.md`     | naming / CTA 契約 |
| navigation 正本 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | route 正本        |
| state core      | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | view ownership    |

## 実行手順

### ステップ1: naming contract を固定する

front の primary label を `実行コンソール`、raw detail label を `高度な表示` に分ける。

### ステップ2: route contract を固定する

`ViewType`、`renderView`、`openExecutionConsole()` の所有者を定義する。

### ステップ3: surface 別 CTA を 1 つに揃える

App Shell / Chat / Workspace / Skill Creator の opening action を同じ dispatcher に束ねる。

## 統合テスト連携

クリック導線、route 遷移、label 表示、no-op 排除を Phase 4 でテスト可能な形に落とす。

## 成果物

| 成果物              | パス                                           | 説明                      |
| ------------------- | ---------------------------------------------- | ------------------------- |
| 設計サマリー        | `outputs/phase-2/design-summary.md`            | 設計結論                  |
| route / action 契約 | `outputs/phase-2/route-and-action-contract.md` | route owner と dispatcher |
| CTA マッピング      | `outputs/phase-2/cta-mapping.md`               | surface ごとのボタン契約  |

## 完了条件

- [ ] front naming と advanced naming が分離されている
- [ ] route owner と shared action owner が定義されている
- [ ] 主要4 surface の CTA が同一契約で表現されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md)
