# Phase 3 成果物: 設計レビュー結果

## レビュー判定

**PASS** — 全レビュー観点で問題なし。Phase 4 へ進行する。

## 要件充足マトリクス

| 要件ID | 要件内容                       | 設計対応箇所                                                                                                                                                        | 充足判定 |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| REQ-1  | runtime routing 分岐（3パス）  | design-summary.md Section 1（RuntimeResolver 共通化）+ Section 2（IPC DI 拡張）。SkillExecutor/AgentExecutor/SkillCreatorService の3パスすべてにRuntimeResolver注入 | PASS     |
| REQ-2  | authMode 参照（Renderer Hook） | design-summary.md Section 4。useSkillExecution/useAgent で `useAuthMode()` 個別セレクタを使用                                                                       | PASS     |
| REQ-3  | TerminalHandoffCard 表示       | design-summary.md Section 3 + ui-ux-realization.md。Props/レイアウト/ビジュアル/ARIA 仕様確定済み                                                                   | PASS     |
| REQ-4  | preflight 契約維持             | contract-matrix.md 既存保証維持マトリクス。RuntimeResolver は preflight の後に呼ばれる設計                                                                          | PASS     |
| REQ-5  | permission 契約維持            | contract-matrix.md 既存保証維持マトリクス。integrated パスでは既存 permission フローが維持される                                                                    | PASS     |
| REQ-6  | streaming 契約維持             | contract-matrix.md 既存保証維持マトリクス。handoff は単一応答、integrated は既存 streaming 維持                                                                     | PASS     |
| REQ-7  | RuntimeResolver 共通化         | design-summary.md Section 1。`services/runtime/` に配置、LLMAdapter 依存解除、DI 維持                                                                               | PASS     |
| REQ-8  | Zustand Store handoff 状態     | design-summary.md Section 5。agentSlice に `handoffGuidance` 追加、P31 準拠個別セレクタ                                                                             | PASS     |
| REQ-9  | API Key 非漏洩                 | design-summary.md Section 2。terminalCommand に API key を含めない設計。TerminalHandoffBuilder の既存セキュリティ設計を継承                                         | PASS     |

## レビュー観点チェックリスト

| レビュー観点        | チェック項目                                            | 結果 | 備考                                                                                                                                                           |
| ------------------- | ------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 要件充足            | 全9要件が設計でカバーされている                         | PASS | 上記マトリクス参照                                                                                                                                             |
| 既存保証維持        | preflight / permission / streaming 契約が維持されている | PASS | RuntimeResolver は preflight チェック後に呼ばれる。integrated パスは既存フロー維持。handoff パスでは streaming は発生しない                                    |
| DI 設計（P5）       | リスナー二重登録のリスクがない                          | PASS | composition root で RuntimeResolver を1回だけ生成し各ハンドラに注入。既存の `unregisterAllIpcHandlers()` / `registerAllIpcHandlers()` パターンで再登録時も安全 |
| 状態管理（P31）     | 合成 Hook 未使用                                        | PASS | `useAuthMode()`、`useHandoffGuidance()`、`useSetHandoffGuidance()` はすべて個別セレクタ                                                                        |
| 状態管理（P48）     | useShallow 適用が必要な箇所が特定されている             | PASS | `handoffGuidance` は単一オブジェクト（`null                                                                                                                    | HandoffGuidance`）であり `.filter()`/`.map()` による派生なし。useShallow 不要 |
| UI/UX（Apple HIG）  | 角丸、スペーシング、カラーが Apple HIG 準拠             | PASS | 角丸 12px、パディング 16px（8px グリッド）、Apple システムカラー使用                                                                                           |
| アクセシビリティ    | コントラスト比 4.5:1 以上、ARIA ラベル付与              | PASS | 4種のテキスト×2モードすべてで 4.5:1 以上。`role="alert"`、`aria-label` 付与済み                                                                                |
| セキュリティ        | API Key が TerminalHandoffCard / ログに漏洩しない       | PASS | HandoffGuidance.terminalCommand に API key を含めない設計。TerminalHandoffCard Props に API key フィールドなし                                                 |
| IPC 契約（P44/P45） | ハンドラ引数と Preload 呼び出し形式が一致               | PASS | 既存の skill:execute / agent:start チャンネルの引数形式は変更しない。応答に handoff フィールドを追加するのみ                                                   |
| P42 バリデーション  | 文字列引数に3段バリデーション                           | PASS | 既存の skill:execute / agent:start ハンドラに3段バリデーション実装済み。RuntimeResolver 追加では新規文字列引数なし                                             |

## 設計忠実度確認

| 設計項目                  | Phase 1 要件                          | Phase 2 設計                                                         | 一致判定     |
| ------------------------- | ------------------------------------- | -------------------------------------------------------------------- | ------------ | ---- |
| RuntimeResolver 配置先    | `services/runtime/RuntimeResolver.ts` | `services/runtime/RuntimeResolver.ts`                                | 一致         |
| DI 方式                   | composition root で1回生成            | `registerAllIpcHandlers` で1回生成し各ハンドラに注入                 | 一致         |
| LLMAdapter 依存解除       | LLMAdapter 依存を解除                 | `RuntimeResolution` 型から adapter フィールドを除去                  | 一致         |
| handoff 状態管理          | agentSlice に追加                     | `handoffGuidance: HandoffGuidance                                    | null` を追加 | 一致 |
| TerminalHandoffCard Props | guidance, onCopyCommand, onDismiss    | guidance, onCopyCommand, onDismiss                                   | 一致         |
| 個別セレクタ              | P31 準拠                              | useHandoffGuidance / useSetHandoffGuidance / useClearHandoffGuidance | 一致         |

## 統合テスト接続点確認

| 接続点                             | テスト可能性                                                                     | 確認結果 |
| ---------------------------------- | -------------------------------------------------------------------------------- | -------- |
| RuntimeResolver → SkillExecutor DI | constructor injection でモック可能                                               | PASS     |
| RuntimeResolver → AgentExecutor DI | 関数引数でモック可能                                                             | PASS     |
| IPC ハンドラ → Preload → Hook      | IPC 応答形式が明確（HandoffResponse 型）。モック可能                             | PASS     |
| TerminalHandoffCard → Store        | `useHandoffGuidance()` セレクタでデータバインド。テスト時は Store を直接設定可能 | PASS     |
| authMode → Hook 分岐               | `useAuthMode()` をモック可能                                                     | PASS     |

## 指摘事項

なし。

## 結論

Phase 2 の設計は Phase 1 の全9要件を満たし、既存の preflight / permission / streaming 契約を維持する設計となっている。P5 / P31 / P42 / P44 / P45 / P48 の各 Pitfall 対策が適切に反映されている。Phase 4（テスト作成）へ進行する。
