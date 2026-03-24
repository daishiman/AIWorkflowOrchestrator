# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| Phase名    | 設計                                      |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 1                                   |
| 後続Phase  | Phase 3（設計レビュー）                   |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

session state machine、artifact-first result、manual share bridge を一つの surface 契約として設計する。

## 実行タスク

- session state contract 設計
- persistence / restore 設計
- artifact bridge 設計
- share / provenance 設計

## 参照資料

| 参照資料       | パス                                                                | 内容                   |
| -------------- | ------------------------------------------------------------------- | ---------------------- |
| Phase 1 成果物 | `phase-1-requirements.md`                                           | task 要件（依存Phase） |
| root pack 設計 | `../../phase-2-design.md`                                           | 親パックの設計仕様     |
| upstream task  | `../step-01-seq-task-01-guided-execution-shell-foundation/index.md` | 先行タスクの前提       |

## 実行手順

### ステップ1: state machine を定義する

`collapsed / ready / running / done / aborted / unavailable` を定義し、各 state の CTA を固定する。

### ステップ2: persistence を定義する

session ID の採番、保持件数、reopen restore、cleanup 条件を定義する。

### ステップ3: artifact bridge を定義する

`成果物 → 要約 → transcript 詳細` の順で結果面を定義する。

## 統合テスト連携

state machine、restore、manual share、artifact priority を Phase 4 でテスト可能な形に落とす。

## 成果物

| 成果物               | パス                                        | 説明                     |
| -------------------- | ------------------------------------------- | ------------------------ |
| 設計サマリー         | `outputs/phase-2/design-summary.md`         | 設計結論                 |
| session state 契約   | `outputs/phase-2/session-state-contract.md` | state / CTA / transition |
| artifact bridge 設計 | `outputs/phase-2/artifact-bridge-design.md` | 結果表示と manual share  |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                | 仕様参照先                                   |
| ------------------ | --------------------------------------- | -------------------------------------------- |
| UI/UX              | dock / artifact / share の surface 設計 | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | session state / store 設計              | `aiworkflow-requirements: architecture-*.md` |
| セキュリティ       | transcript share / provenance           | `aiworkflow-requirements: security-*.md`     |
| エラーハンドリング | aborted state / restore failure         | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 完了条件

- [ ] state machine が 8 state（collapsed/ready/handoff/running/done/aborted/unavailable/guidance-only）で定義されている
- [ ] session restore の条件が定義されている
- [ ] artifact-first の表示順が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md)
