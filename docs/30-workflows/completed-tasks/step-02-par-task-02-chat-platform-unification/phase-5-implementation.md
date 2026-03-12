# Phase 5: 実装

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 5                                                        |
| Phase名    | 実装                                                     |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 機能名     | chat-platform-unification                                |
| 前提Phase  | [phase-4-test-creation.md](./phase-4-test-creation.md)   |
| 後続Phase  | [phase-6-test-expansion.md](./phase-6-test-expansion.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-11                                               |

## 目的

Task02 設計に従い、共通会話基盤を実装し、既存チャット導線を mode 差分として統合する。

## 実装対象

- 共通チャット状態モデル
- ストリーミング統合
- 会話履歴永続化
- Workspace 文脈 adapter
- `skill-lifecycle` mode の露出

## 実行タスク

- Session Agent 実装: 会話 ID / history persistence / resume を統合する
- Stream Agent 実装: chunk / abort / retry / done lifecycle を統合する
- Context Agent 実装: workspace / skill-lifecycle adapter を統合する
- Contract Agent 整合: Task03 向け public API / forbidden boundary を整える

## SubAgent 分担

| 役割           | 責務                                        |
| -------------- | ------------------------------------------- |
| Session Agent  | 会話 ID / history persistence / resume      |
| Stream Agent   | chunk / abort / retry / done lifecycle      |
| Context Agent  | workspace / skill-lifecycle adapter         |
| Contract Agent | Task03 向け public API / forbidden boundary |

## 参照資料

| 参照資料                 | パス                                          | 内容               |
| ------------------------ | --------------------------------------------- | ------------------ |
| テストマトリクス         | `outputs/phase-4/test-matrix.md`              | 実装対象の検証観点 |
| 契約テストチェックリスト | `outputs/phase-4/contract-test-checklist.md`  | downstream 契約    |
| 共通ドメインモデル       | `outputs/phase-2/common-chat-domain-model.md` | entity / interface |
| mode 遷移設計            | `outputs/phase-2/mode-state-transition.md`    | mode state         |
| context adapter 設計     | `outputs/phase-2/context-adapter-design.md`   | 文脈差分吸収       |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                       |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| llm-streaming           | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`           | streaming 契約             |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | persistence 契約           |
| llm-workspace-chat-edit | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | workspace adapter          |
| arch-state-management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | store ownership            |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | abort / timeout / IPC 安全 |

## 実行手順

1. Phase 4 で定義した Red テストを先に失敗状態へ持ち込み、session / stream / adapter の順に実装する。
2. `chatSlice` と `useStreamingChat` を再配置し、共通基盤 API を露出する。
3. `general` `workspace` `skill-lifecycle` の 3 mode を同一基盤へ接続する。
4. Task03 が参照する public contract を明示し、内部実装との差分を整理する。

## 統合テスト連携

| 観点            | 連携内容                                                            |
| --------------- | ------------------------------------------------------------------- |
| public contract | Task03 が依存する API / state を直接検証できるようにする            |
| UI 接合         | ChatView / WorkspaceView / skill-lifecycle 起点を共通基盤へ接続する |
| streaming UX    | partial response / abort / retry の視覚フィードバックを維持する     |
| persistence     | history resume と mode 切替時の session 保持を統合テストへ引き継ぐ  |

## 成果物

| 成果物                  | パス                                            | 説明               |
| ----------------------- | ----------------------------------------------- | ------------------ |
| 変更ファイルマトリクス  | `outputs/phase-5/change-file-matrix.md`         | 実装対象一覧       |
| 実装ログ                | `outputs/phase-5/implementation-log.md`         | 実装順序と判断根拠 |
| chat platform diff 要約 | `outputs/phase-5/chat-platform-diff-summary.md` | 変更差分要約       |

## 完了条件

- [x] 3 mode が同一基盤で動作する
- [x] session / stream / history / adapter の責務境界どおりに実装されている
- [x] Task03 が共通 API を利用できる
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-4-test-creation.md](./phase-4-test-creation.md)
- 後続: [phase-6-test-expansion.md](./phase-6-test-expansion.md)

## サブタスク管理

- [x] Red テスト確認
- [x] Session Agent 実装
- [x] Stream Agent 実装
- [x] Context Agent 実装
- [x] Contract Agent 整合
- [x] 成果物作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] Task04 のテスト観点へ全実装が対応付けられている
- [x] Task03 public contract が実装差分に反映されている

## 次のPhase

Phase 6: [phase-6-test-expansion.md](./phase-6-test-expansion.md)
