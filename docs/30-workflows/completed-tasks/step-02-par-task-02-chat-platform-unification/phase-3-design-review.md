# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 3                                                      |
| Phase名    | 設計レビュー                                           |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                |
| タスク名   | 会話基盤・セッション統合                               |
| 機能名     | chat-platform-unification                              |
| 前提Phase  | [phase-2-design.md](./phase-2-design.md)               |
| 後続Phase  | [phase-4-test-creation.md](./phase-4-test-creation.md) |
| ステータス | completed                                              |
| 作成日     | 2026-03-11                                             |

## 目的

会話基盤設計が、重複実装、状態分散、文脈注入の混線を防げるかを判定し、Task03 へ引き渡せる品質かをレビューする。

## 実行タスク

- 設計レビュー: 共通基盤と mode 差分が責務単位で分離されているか確認する
- 責務競合レビュー: `chatSlice` と `useStreamingChat` の競合解消案を確認する
- 文脈境界レビュー: Workspace 文脈注入が通常会話を汚染しないか確認する
- 後続依存レビュー: Task03 が追加独自基盤を作らずに済むか判定する
- 仕様抽出レビュー: aiworkflow-requirements の参照順序で設計の根拠が追えるか確認する

## 参照資料

| 参照資料                        | パス                                                                                 | 内容                    |
| ------------------------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| 共通ドメインモデル              | `outputs/phase-2/common-chat-domain-model.md`                                        | 基盤設計                |
| mode 遷移設計                   | `outputs/phase-2/mode-state-transition.md`                                           | 状態遷移                |
| session / stream / history 境界 | `outputs/phase-2/session-stream-history-boundary.md`                                 | 責務分離                |
| context adapter 設計            | `outputs/phase-2/context-adapter-design.md`                                          | 文脈差分吸収            |
| 要件定義書                      | `outputs/phase-1/requirements-definition.md`                                         | AC / forbidden boundary |
| Task03 設計要求                 | `../step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | 後続依存確認            |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                   |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| llm-streaming           | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`           | stream lifecycle       |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | session / history 契約 |
| llm-workspace-chat-edit | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | workspace context      |
| arch-state-management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | store ownership        |
| ui-ux-navigation        | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | Task01 導線整合        |

## 実行手順

1. Phase 2 の 4 主要成果物をレビュー単位ごとに分割し、Reviewer 役割を session / adapter / state / downstream に割り当てる。
2. 共通基盤と mode adapter の境界、public contract、forbidden boundary をチェックする。
3. aiworkflow-requirements の参照順序どおりに設計根拠が追えるか確認する。
4. 指摘を `MAJOR` `MINOR` `NIT` に分類し、Task04 以降へ進めるか判定する。

## 統合テスト連携

| 観点             | 連携内容                                                              |
| ---------------- | --------------------------------------------------------------------- |
| 契約テスト       | public contract と forbidden boundary を Phase 4 テスト観点へ引き継ぐ |
| 画面連携         | Task01 導線から mode adapter へ入る接合条件を統合テストへ引き継ぐ     |
| failure handling | abort / resume / context leak を失敗系テストへ引き継ぐ                |

## 成果物

| 成果物           | パス                                        | 説明                      |
| ---------------- | ------------------------------------------- | ------------------------- |
| レビュー指摘一覧 | `outputs/phase-3/design-review-findings.md` | 指摘と重要度              |
| レビュー判定     | `outputs/phase-3/design-review-result.md`   | PASS / MINOR / MAJOR 判定 |
| 改善計画         | `outputs/phase-3/remediation-plan.md`       | 指摘対応計画              |

## 完了条件

- [x] MAJOR 指摘が 0 件
- [x] Task03 への引継ぎ可否が判定されている
- [x] 仕様抽出順序で設計根拠が追跡できる
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-2-design.md](./phase-2-design.md)
- 後続: [phase-4-test-creation.md](./phase-4-test-creation.md)

## サブタスク管理

- [x] 設計成果物確認
- [x] session / adapter / state / downstream レビュー
- [x] 指摘分類
- [x] remediation plan 作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] Review result と findings が整合している
- [x] Task04 が直接参照できる指摘一覧になっている

## 次のPhase

Phase 4: [phase-4-test-creation.md](./phase-4-test-creation.md)
