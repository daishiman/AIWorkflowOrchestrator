# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 4                                                        |
| Phase名    | テスト作成                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 機能名     | chat-platform-unification                                |
| 前提Phase  | [phase-3-design-review.md](./phase-3-design-review.md)   |
| 後続Phase  | [phase-5-implementation.md](./phase-5-implementation.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-11                                               |

## 目的

共通チャット基盤の mode 切替、ストリーミング、履歴、文脈注入、Task03 handoff を検証するテスト仕様を作成する。

## 実行タスク

- テスト境界定義: 単体テストと統合テストの境界を決める
- mode request テスト設計: mode ごとの request 生成観点を定義する
- stream テスト設計: chunk / abort / retry / done の契約テストを定義する
- history テスト設計: conversationId 生成 / 再利用 / resume / persistence を定義する
- adapter テスト設計: workspace context 注入と skill-lifecycle mode 分離を定義する
- Task03 契約テスト設計: public contract / forbidden boundary を定義する

## 参照資料

| 参照資料           | パス                                                                                       | 内容                  |
| ------------------ | ------------------------------------------------------------------------------------------ | --------------------- |
| レビュー指摘一覧   | `outputs/phase-3/design-review-findings.md`                                                | 要対策項目            |
| 共通ドメインモデル | `outputs/phase-2/common-chat-domain-model.md`                                              | entity / value object |
| mode 遷移設計      | `outputs/phase-2/mode-state-transition.md`                                                 | 状態遷移              |
| Task03 要件        | `../step-02-par-task-03-skill-creator-execute-improve-integration/phase-1-requirements.md` | 後続依存契約          |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                   |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| llm-streaming           | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`           | chunk / done / abort   |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | history persistence    |
| llm-workspace-chat-edit | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | workspace context      |
| arch-state-management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | slice / local state    |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | abort / timeout 安全性 |

## 実行手順

1. session / stream / history / adapter / downstream を別テストレイヤーへ分ける。
2. 単体テストで domain / adapter / selector を、統合テストで UI 接合と IPC 契約を担当させる。
3. Phase 11 の screenshot preplan を先に作成し、3 mode の代表画面を定義する。
4. Task03 handoff 用の success / failure 契約テストを明示する。

## 統合テスト連携

| 観点            | 連携内容                                                         |
| --------------- | ---------------------------------------------------------------- |
| session 継続性  | conversationId 再利用と resume を統合テストへ含める              |
| streaming UX    | partial response / abort / retry を UI と state 両方で検証する   |
| context adapter | workspace 文脈あり / なし / skill-lifecycle mode を比較検証する  |
| Task03 handoff  | skill-lifecycle mode contract を downstream 契約テストへ引き継ぐ |

## 成果物

| 成果物                       | パス                                            | 説明                       |
| ---------------------------- | ----------------------------------------------- | -------------------------- |
| テストマトリクス             | `outputs/phase-4/test-matrix.md`                | 単体 / 統合 / failure 分離 |
| 契約テストチェックリスト     | `outputs/phase-4/contract-test-checklist.md`    | Task03 handoff 含む        |
| Phase 11 screenshot 事前計画 | `outputs/phase-4/phase11-screenshot-preplan.md` | 3 mode 代表画面            |
| Red チェックリスト           | `outputs/phase-4/red-checklist.md`              | 失敗すべきテスト一覧       |

## 完了条件

- [x] 単体テストと統合テストの境界が明記されている
- [x] streaming / history / adapter / handoff の各契約テストが定義されている
- [x] Task03 契約テスト観点が含まれている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-3-design-review.md](./phase-3-design-review.md)
- 後続: [phase-5-implementation.md](./phase-5-implementation.md)

## サブタスク管理

- [x] レビュー指摘反映
- [x] テストレイヤー定義
- [x] contract test checklist 作成
- [x] screenshot preplan 作成
- [x] red checklist 作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 主要契約がテスト観点へすべて対応付けられている
- [x] Phase 11 の代表シナリオが定義されている

## 次のPhase

Phase 5: [phase-5-implementation.md](./phase-5-implementation.md)
