# Phase 4: テスト作成

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 4              |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

Phase 2 設計に基づき、TDD Red Phase としてテストコードを先行作成する。全テストが「失敗する」状態であることを確認してから Phase 5 へ進む。

## 実行タスク

### Task 1: ModifierResponse 拡張テスト

対象ファイル: `apps/desktop/src/main/slide/__tests__/modifier-skill.test.ts`（既存に追加）

#### T1-1. parseModifierResponse の拡張フィールドパーステスト

| テストID | テスト内容                                                       | 期待結果                                      |
| -------- | ---------------------------------------------------------------- | --------------------------------------------- |
| T1-1-1   | `fallback_reason` が含まれる JSON を正しくパースする             | `fallback_reason` フィールドに値が設定される  |
| T1-1-2   | `suggested_action` が含まれる JSON を正しくパースする            | `suggested_action` フィールドに値が設定される |
| T1-1-3   | 両フィールドが含まれない JSON を正しくパースする（後方互換）     | 両フィールドが `undefined`                    |
| T1-1-4   | `fallback_reason` が number 型の場合 `undefined` に正規化される  | typeof 検証により `undefined`                 |
| T1-1-5   | `suggested_action` が object 型の場合 `undefined` に正規化される | typeof 検証により `undefined`                 |
| T1-1-6   | 両フィールドが同時に含まれる JSON を正しくパースする             | 両フィールドに値が設定される                  |

### Task 2: SlideCapabilityDTO IPC テスト

対象ファイル: `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`（既存に追加）

#### T2-1. `slide:capability:get` P42 準拠バリデーションテスト

| テストID | テスト内容                                  | 期待結果                                                  |
| -------- | ------------------------------------------- | --------------------------------------------------------- |
| T2-1-1   | `sessionId` が `undefined` の場合           | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| T2-1-2   | `sessionId` が数値の場合                    | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| T2-1-3   | `sessionId` が空文字列の場合                | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| T2-1-4   | `sessionId` がスペースのみの場合            | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| T2-1-5   | 有効な `sessionId` で capability が返される | `{ success: true, data: SlideCapabilityDTO }`             |
| T2-1-6   | `args` が `null` の場合                     | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| T2-1-7   | `args` が `undefined` の場合                | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |

#### T2-2. IPC レスポンス形式テスト（P60 準拠）

| テストID | テスト内容                                                  | 期待結果                                                    |
| -------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| T2-2-1   | 成功時のレスポンスに `success: true` と `data` が含まれる   | `{ success: true, data: { lane, apiKeySource, uiStatus } }` |
| T2-2-2   | 失敗時のレスポンスに `success: false` と `error` が含まれる | `{ success: false, error: { code, message } }`              |

### Task 3: Agent SDK adapter テスト

対象ファイル: `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`（既存に追加）

#### T3-1. DI パターンテスト

| テストID | テスト内容                                                         | 期待結果                                |
| -------- | ------------------------------------------------------------------ | --------------------------------------- |
| T3-1-1   | `createModifierAgentAPI` に依存オブジェクトを注入できる            | API オブジェクトが生成される            |
| T3-1-2   | `authKeyService.getKey()` が `none` を返す場合にエラー（P62 対策） | 即座にエラー、fallback なし             |
| T3-1-3   | `agentSDKAdapter` が未指定の場合にデフォルトで初期化される         | SDK adapter が自動生成される            |
| T3-1-4   | モック adapter を注入してテスト可能（NFR-4）                       | モック adapter 経由で呼び出しが行われる |
| T3-1-5   | `runtimeResolver` の結果に応じて lane が判定される                 | integrated / manual が正しく分岐        |

### Task 4: Preload / Channel 登録テスト

対象ファイル: `apps/desktop/src/main/slide/__tests__/channel-sync.test.ts`（既存に追加）

| テストID | テスト内容                                                   | 期待結果             |
| -------- | ------------------------------------------------------------ | -------------------- |
| T4-1     | `SLIDE_CAPABILITY_GET` が IPC_CHANNELS に定義されている      | 定数が存在する       |
| T4-2     | `SLIDE_CAPABILITY_GET` が ALLOWED_INVOKE_CHANNELS に含まれる | allowlist に登録済み |
| T4-3     | channel 名が `slide:capability:get` である                   | 文字列一致           |

### Task 5: Preload 型定義テスト

対象ファイル: `apps/desktop/src/main/slide/__tests__/preload-types.test.ts`（新規）

| テストID | テスト内容                                                                  | 期待結果                   |
| -------- | --------------------------------------------------------------------------- | -------------------------- |
| T5-1     | `SlideCapabilityResponse` 型が `success: boolean` を持つ                    | 型定義が正しい             |
| T5-2     | `SlideCapabilityResponse.data` が `SlideCapabilityDTO` 型である（optional） | P32 準拠で shared 型と一致 |
| T5-3     | `SlideCapabilityResponse.error` が `{ code: string; message: string }` 型   | P60 準拠のエラー形式       |

## 参照資料

| 資料名           | パス                       | 内容                    |
| ---------------- | -------------------------- | ----------------------- |
| Phase 2 設計     | `phase-2-design.md`        | 型設計・IPC契約・DI設計 |
| Phase 3 レビュー | `phase-3-design-review.md` | レビュー結果            |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                     | 内容                    |
| ------------------ | ---------------------------------------- | ----------------------- |
| テスト設計パターン | `.claude/rules/02-code-quality.md`       | TDD原則・カバレッジ基準 |
| P42 バリデーション | `.claude/rules/06-known-pitfalls.md#P42` | 3段バリデーション標準   |
| P60 レスポンス形式 | `.claude/rules/06-known-pitfalls.md#P60` | IPC テスト応答形式      |

## 統合テスト連携

- Phase 4 ではテスト作成のみ。実行は Phase 5 以降。
- IPC 統合テスト: `slide:capability:get` の end-to-end フロー検証テストを設計
- Agent SDK adapter テスト: mock adapter 注入による LLM 呼び出し検証テストを設計

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                |
| ------------------ | ---- | ----------------------------------------------------------- |
| セキュリティ       | 適用 | P42 バリデーションテスト（null/undefined/empty/whitespace） |
| API設計            | 適用 | P60 準拠レスポンス形式のアサーション                        |
| エラーハンドリング | 適用 | P62 対策（API key 未設定時のエラー挙動）                    |

## 成果物

| 成果物            | パス                                                           | 説明                                |
| ----------------- | -------------------------------------------------------------- | ----------------------------------- |
| テスト設計書      | `outputs/phase-4/test-design.md`                               | 本ファイル                          |
| テストコード（1） | `apps/desktop/src/main/slide/__tests__/modifier-skill.test.ts` | ModifierResponse 拡張テスト（追加） |
| テストコード（2） | `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`   | IPC capability テスト（追加）       |
| テストコード（3） | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`   | Agent SDK adapter テスト（追加）    |
| テストコード（4） | `apps/desktop/src/main/slide/__tests__/channel-sync.test.ts`   | Channel 登録テスト（追加）          |
| テストコード（5） | `apps/desktop/src/main/slide/__tests__/preload-types.test.ts`  | Preload 型定義テスト（新規）        |

## 完了条件

- [x] ModifierResponse 拡張フィールドのパーステスト（6ケース）が作成されている
- [x] `slide:capability:get` P42 バリデーションテスト（7ケース）が作成されている
- [x] IPC レスポンス形式テスト（2ケース）が作成されている
- [x] Agent SDK adapter DI テスト（5ケース）が作成されている
- [x] Channel 登録テスト（3ケース）が作成されている
- [x] Preload 型定義テスト（3ケース）が作成されている
- [x] 全テストが Red 状態（未実装のため失敗）であることを確認した
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 5: 実装
