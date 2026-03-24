# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 3              |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

Phase 1（要件定義）と Phase 2（設計）の妥当性を検証し、Phase 4（テスト作成）に進めるかを判定する。

## 実行タスク

### Task 1: 要件と設計の整合性チェック

| FR/NFR                          | Phase 2 設計での対応                                                  | 判定 |
| ------------------------------- | --------------------------------------------------------------------- | ---- |
| FR-1 (ModifierResponse 拡張)    | Task 1-1 で optional フィールド追加。後方互換維持。                   | PASS |
| FR-2 (Agent SDK adapter 化)     | Task 3 で DI 設計。IAuthKeyService + RuntimePolicyResolver パターン。 | PASS |
| FR-3 (SlideCapabilityDTO + IPC) | Task 1-2 + Task 2 で型・channel・バリデーション定義。                 | PASS |
| FR-4 (Preload API 追加)         | Task 2-3 で safeInvoke パターン。                                     | PASS |
| NFR-1 (後方互換性)              | 既存フィールド変更なし。optional 追加のみ。                           | PASS |
| NFR-2 (セキュリティ)            | P42 3段バリデーション、sender 検証、パストラバーサル。                | PASS |
| NFR-3 (型安全)                  | P48/P49 準拠。any 不使用。typeof 実行時検証。                         | PASS |
| NFR-4 (テスタビリティ)          | DI パターンで全外部依存を注入可能。                                   | PASS |
| NFR-5 (P62 対策)                | authKeyService.getKey() が none で即エラー。fallback なし。           | PASS |

### Task 2: IPC 契約レビュー

#### 2-1. channel 名の namespace 整合

| 確認項目                                                 | 結果                                                |
| -------------------------------------------------------- | --------------------------------------------------- |
| `slide:capability:get` が既存 `slide:*` namespace に一致 | PASS                                                |
| 既存 channel との名前衝突なし                            | PASS（`grep "slide:capability" channels.ts` → 0件） |
| `handle` パターン使用（read-only 操作）                  | PASS                                                |

#### 2-2. P42 準拠チェック

| チェック項目                                 | 設計書の対応    | 判定 |
| -------------------------------------------- | --------------- | ---- |
| 1段目: `typeof args?.sessionId !== "string"` | Task 2-2 に明記 | PASS |
| 2段目: `args.sessionId === ""`               | Task 2-2 に明記 | PASS |
| 3段目: `args.sessionId.trim() === ""`        | Task 2-2 に明記 | PASS |

#### 2-3. レスポンス形式チェック（P60 準拠）

| パターン                                             | 設計書の対応    | 判定 |
| ---------------------------------------------------- | --------------- | ---- |
| 成功: `{ success: true, data: SlideCapabilityDTO }`  | Task 2-2 に明記 | PASS |
| 失敗: `{ success: false, error: { code, message } }` | Task 2-2 に明記 | PASS |

### Task 3: Agent SDK adapter 設計レビュー

| チェック項目                          | 設計書の対応                               | 判定 |
| ------------------------------------- | ------------------------------------------ | ---- |
| P34 (遅延初期化 DI)                   | agentSDKAdapter は API key 取得後に初期化  | PASS |
| P61 (DIP)                             | 引数型はインターフェース (IAuthKeyService) | PASS |
| P62 (暗黙 fallback 禁止)              | getKey() → none で即エラー                 | PASS |
| ModifierAgentAPI インターフェース維持 | 後方互換で維持                             | PASS |

### Task 4: 既知の落とし穴チェック

| Pitfall                          | 該当する設計要素                                       | 対策                                              | 判定 |
| -------------------------------- | ------------------------------------------------------ | ------------------------------------------------- | ---- |
| P23 (API 二重定義)               | SlideCapabilityDTO が shared と preload に分散         | shared に一元化し preload は import               | PASS |
| P32 (型二箇所同時更新)           | ModifierResponse が shared と modifier-skill.ts に存在 | shared に型定義。modifier-skill.ts は import のみ | PASS |
| P42 (trim バリデーション)        | sessionId の3段バリデーション                          | 設計書に明記                                      | PASS |
| P44 (IPC インターフェース不整合) | Preload と handler の引数形式                          | 両方 `{ sessionId: string }` で一致               | PASS |
| P45 (引数命名ドリフト)           | sessionId の命名                                       | 全レイヤーで sessionId 統一                       | PASS |
| P48 (non-null assertion)         | parseModifierResponse での新フィールドパース           | typeof 検証で安全にアクセス                       | PASS |
| P49 (as キャスト)                | 型ガード                                               | in 演算子 + typeof で実行時検証                   | PASS |
| P60 (IPC 応答形式)               | レスポンス wrapper                                     | `{ success, data?, error? }` 統一                 | PASS |
| P62 (DEFAULT_CONFIG fallback)    | API key 未設定時                                       | 即エラー、fallback なし                           | PASS |
| P65 (dead-end namespace)         | slide:capability:get                                   | 既存 slide:\* namespace に統合                    | PASS |

### Task 5: MINOR 指摘

| ID      | 指摘内容                                                                                                                                       | 重要度 | 対応                                                                                                                                                  |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| MINOR-1 | `resolveSlideCapability()` 関数の詳細実装が Phase 2 に未記載。sessionId から lane/apiKeySource/uiStatus をどう算出するかの内部ロジックが不明。 | MINOR  | **対応済み**: Phase 2 Task 5 に擬似コード・状態遷移根拠テーブルを追記。RuntimeResolver + IAuthKeyService の結果から算出する方針を設計レベルで明確化。 |
| MINOR-2 | `modifier-skill.ts` の `ModifierResponse` 型は現在ローカル定義（L40-44）。`packages/shared/src/slide/types.ts` への移動が必要かの判断。        | MINOR  | Phase 5 実装時に判断。shared に SkillExecutionResult が既にあるため、ModifierResponse も shared に移動が望ましい。                                    |

## レビュー判定

| 判定     | 理由                                                                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **PASS** | FR/NFR 全項目が設計で対応済み。IPC 契約は P42/P60/P65 準拠。Agent SDK adapter は P34/P61/P62 準拠。MINOR 指摘 2 件は Phase 5 で対応可能。 |

→ **Phase 4（テスト作成）へ進行**

## 参照資料

| 資料名           | パス                      | 内容                    |
| ---------------- | ------------------------- | ----------------------- |
| Phase 1 要件定義 | `phase-1-requirements.md` | FR/NFR/AC               |
| Phase 2 設計     | `phase-2-design.md`       | 型設計・IPC契約・DI設計 |

## 統合テスト連携

- Phase 3 では統合テストの観点レビューのみ。
- IPC 統合テストと Agent SDK adapter テストの観点が Phase 2 で定義されていることを確認 → PASS

## 成果物

| 成果物           | パス                               | 説明       |
| ---------------- | ---------------------------------- | ---------- |
| 設計レビュー結果 | `outputs/phase-3/design-review.md` | 本ファイル |

## 完了条件

- [x] FR/NFR 全項目と設計の整合性を検証した
- [x] IPC 契約の P42/P60/P65 準拠を確認した
- [x] Agent SDK adapter の P34/P61/P62 準拠を確認した
- [x] 既知の落とし穴（P23/P32/P42/P44/P45/P48/P49/P60/P62/P65）をチェックした
- [x] MINOR 指摘を記録した
- [x] レビュー判定を記録した（PASS → Phase 4 へ）
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 4: テスト作成
