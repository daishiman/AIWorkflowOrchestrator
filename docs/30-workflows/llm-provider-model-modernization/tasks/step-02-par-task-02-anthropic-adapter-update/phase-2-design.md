# Phase 2: 設計 — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 2                        |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

Phase 1 の要件定義を受け、`AnthropicAdapter.ts` L207 のモデルID変更に必要な設計（変更箇所・テスト設計・影響範囲）を確定する。

## 実行タスク

### Task 2-1: 変更対象コードの設計

#### 変更前

```typescript
// apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts L207
model: "claude-3-haiku-20240307", // 最安モデル
```

#### 変更後

```typescript
// apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts L207
model: "claude-haiku-4-5", // 最安・最速モデル
```

変更内容: 文字列リテラルの置換のみ。型定義・メソッドシグネチャ・ロジックの変更なし。

### Task 2-2: `checkHealth` メソッドの設計確認

変更後のヘルスチェックリクエストボディ（設計値）:

```json
{
  "model": "claude-haiku-4-5",
  "messages": [{ "role": "user", "content": "Hi" }],
  "max_tokens": 1
}
```

ヘッダー（変更なし）:

```
Content-Type: application/json
x-api-key: <apiKey>
anthropic-version: 2023-06-01
```

エンドポイント（変更なし）:

```
POST https://api.anthropic.com/v1/messages
```

### Task 2-3: テスト設計

#### 新規追加テストケース

| テストID | 説明                                                                              | 期待値                                      |
| -------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| HC-001   | `checkHealth` が送信するリクエストの model フィールドが `claude-haiku-4-5` である | `capturedBody.model === "claude-haiku-4-5"` |

#### 既存テストケースへの影響

| テストID（既存）                               | 影響                  | 対応     |
| ---------------------------------------------- | --------------------- | -------- |
| `checkHealth - should return connected status` | なし（model検証なし） | 変更不要 |
| `checkHealth - should return error status`     | なし（model検証なし） | 変更不要 |
| `ADP-008` / `ADP-009` / `ADP-010`              | なし（sendChat系）    | 変更不要 |

#### テストファイルパス

```
apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

HC-001 は `describe("checkHealth")` ブロック内に追加する。

### Task 2-4: 影響範囲設計

```
変更ファイル:
  apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts  ← 変更対象（1行）

テストファイル:
  apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts ← HC-001 追加

影響なしファイル:
  apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts    （基底クラス、変更なし）
  apps/desktop/src/main/adapters/llm/types.ts             （型定義、変更なし）
  apps/desktop/src/main/handlers/llm.ts                   （PROVIDER_CONFIGS、Task01担当）
  packages/shared/src/types/llm/schemas/provider.ts       （スキーマ、変更なし）
```

### Task 2-5: IPC契約への影響確認

`checkHealth` は IPC ハンドラーから呼び出されるが、メソッドシグネチャ（引数・戻り値型）は変更しない。IPC 契約ドリフトは発生しない。

```typescript
// 変更なし: checkHealth(): Promise<HealthCheckResult>
```

## 参照資料

| ドキュメント                                                            | 用途                                  |
| ----------------------------------------------------------------------- | ------------------------------------- |
| `research/anthropic-models.md`                                          | `claude-haiku-4-5` の正式モデルID確認 |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`                | 変更対象コードの確認                  |
| `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | 既存テスト設計の確認                  |
| `phase-1-requirements.md`                                               | 要件・受入基準の参照                  |

## 統合テスト連携

- Task04（テスト期待値更新）の設計と干渉しないことを確認済み（Task04はハンドラーレベルのテスト担当）
- 本タスクの HC-001 は Adapter 単体テストに限定

## 成果物

| 成果物         | パス                                                                                                                      | 備考       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Phase 2 設計書 | `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/phase-2-design.md` | 本ファイル |

## 完了条件

- [ ] 変更箇所が1ファイル1行（`AnthropicAdapter.ts` L207）に特定されている
- [ ] 変更前後のコードが具体的に記述されている
- [ ] 新規テストケース HC-001 の設計（テストID・説明・期待値）が定義されている
- [ ] 既存テストへの影響が「変更不要」として確認されている
- [ ] 影響範囲ファイル一覧が完全である
- [ ] IPC 契約への影響が「なし」として確認されている

## 次のPhase

Phase 3: 設計レビュー（`phase-3-design-review.md`）
