# Phase 3: 設計レビュー報告

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| Phase      | 3                                   |
| レビュー日 | 2026-03-18                          |
| 総合判定   | **PASS**（MINOR 3件）               |
| MAJOR指摘  | 0件                                 |
| MINOR指摘  | 3件                                 |

## レビュー結果一覧

| 観点             | ID  | 判定      | 概要                                                                                  |
| ---------------- | --- | --------- | ------------------------------------------------------------------------------------- |
| アーキテクチャ   | A-1 | PASS      | selected config 反映経路が Renderer→Preload→Main で 1 本化                            |
| アーキテクチャ   | A-2 | PASS      | Chat Edit との command surface 分離（llm:stream-chat vs chat-edit:send-with-context） |
| アーキテクチャ   | A-3 | PASS      | Main/Renderer 責務境界がレイヤー依存方向に準拠                                        |
| アーキテクチャ   | A-4 | PASS      | P31/P48 対策済み（個別セレクタ + useShallow）                                         |
| IPC/セキュリティ | B-1 | PASS      | 全チャンネルが IPC_CHANNELS 定数管理、ホワイトリスト登録済み                          |
| IPC/セキュリティ | B-2 | **MINOR** | CH-01 messages 配列要素 / CH-05 requestId の P42 バリデーション未明記                 |
| IPC/セキュリティ | B-3 | PASS      | Renderer 3 段階防御パターン設計済み                                                   |
| IPC/セキュリティ | B-4 | PASS      | API key の Renderer/handoff 漏洩防止設計済み                                          |
| UI/UX            | C-1 | PASS      | LLMErrorCode 全 10 値のガイダンス定義済み                                             |
| UI/UX            | C-2 | PASS      | 全 8 状態 + empty state 4 パターン定義済み                                            |
| UI/UX            | C-3 | PASS      | WCAG 2.1 AA 要件定義済み（role, aria, keyboard）                                      |
| UI/UX            | C-4 | PASS      | silent fallback 禁止、guidance block 表示設計済み                                     |
| 落とし穴         | D-1 | PASS      | P62 DEFAULT_CONFIG fallback 禁止が設計に明記                                          |
| 落とし穴         | D-2 | PASS      | P31/P48 対策が個別セレクタ + useShallow で設計済み                                    |
| 落とし穴         | D-3 | **MINOR** | P39 happy-dom テスト方針（fireEvent 使用）が設計書に未記載                            |
| 落とし穴         | D-4 | PASS      | P60 wrapper 形式が意図的に文書化された差異として設計済み                              |
| タスク間契約     | 3-5 | **MINOR** | handoff capability 判定の Task02 接続点が不明確                                       |

## MINOR 指摘詳細

### MINOR-1: B-2 P42 バリデーション記述の補完

- **対象**: contract-matrix.md
- **指摘内容**:
  1. CH-01（llm:stream-chat）の `messages` 配列内各要素（`content` フィールド）に対する P42 3段バリデーション定義が未記載
  2. CH-05（llm:stream-cancel）の `requestId` に対する P42 3段バリデーション（typeof → 空文字列 → trim）が未明記
- **影響**: 実装時に P42 準拠漏れのリスク（低）
- **対応方針**: Phase 5 実装時にバリデーションを確実に適用。未タスク化は不要（設計書の記述精度の問題）

### MINOR-2: D-3 P39 テスト方針の明示

- **対象**: 設計書全般
- **指摘内容**: Phase 4 テスト作成に向けて「happy-dom 環境では userEvent.setup() を使用せず fireEvent を使用する」方針が設計書に未記載
- **影響**: Phase 4 担当エージェントが P39 を踏むリスク（低〜中）
- **対応方針**: Phase 4 テスト作成時に fireEvent 使用を明示的に指示

### MINOR-3: Task 3-5 handoff capability 接続点

- **対象**: component-hierarchy.md の Task02 依存セクション
- **指摘内容**: `handoff` 状態の capability 判定で Task02 からどの IPC チャンネル・Store フィールド経由で capability を取得するかが不明確
- **影響**: Task02 設計との接続時に手戻りリスク（低）
- **対応方針**: Task02 Phase 2 成果物確定後に接続点を明記。現時点では固定値 `integratedRuntime` で開発可能

## レビューゲート判定

| 条件                   | 結果                          |
| ---------------------- | ----------------------------- |
| MAJOR 指摘 0 件        | OK（0件）                     |
| A-1〜A-4 全 PASS/MINOR | OK（全 PASS）                 |
| B-1〜B-4 全 PASS/MINOR | OK（B-2 MINOR のみ）          |
| C-1〜C-4 全 PASS/MINOR | OK（全 PASS）                 |
| D-1〜D-4 全 PASS       | OK（D-3 MINOR のみ）          |
| タスク間契約矛盾なし   | OK（MINOR 1件、機能影響なし） |

**結論: Phase 4（テスト作成）に進行可能**

## Phase 4 への引き渡し事項

1. テスト環境は happy-dom。`fireEvent` を使用し、`userEvent.setup()` は使用しない（P39）
2. IPC レスポンスのアサーションは wrapper 形式（`{ success, data?, error? }`）と push 形式を区別する（P60）
3. CH-01 の messages 配列要素、CH-05 の requestId に P42 バリデーションテストを含める
4. Store セレクタテストでは `useChatMessagesShallow`（useShallow 適用）を使用する（P48）
