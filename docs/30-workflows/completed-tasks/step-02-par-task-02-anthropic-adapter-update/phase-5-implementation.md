# Phase 5: 実装（TDD: Green） — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 5                        |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

Phase 4 で Red 状態になったテスト HC-001 を Green（成功）にするため、`AnthropicAdapter.ts` L207 のモデルID文字列を置換する。

## 実行タスク

### Task 5-1: 前提条件確認

- Phase 4 の HC-001 が Red 状態であることを確認する
- `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` を開き、L207 を確認する

```bash
grep -n "claude-3-haiku-20240307" apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts
```

期待される出力:

```
207:            model: "claude-3-haiku-20240307", // 最安モデル
```

### Task 5-2: モデルID文字列の置換

`apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` L207 を以下のとおり編集する。

**変更前:**

```typescript
            model: "claude-3-haiku-20240307", // 最安モデル
```

**変更後:**

```typescript
            model: "claude-haiku-4-5", // 最安・最速モデル
```

変更内容: 文字列リテラルとコメントのみ。ロジック・型・構造に変更なし。

### Task 5-3: 変更の確認

置換後、レガシーモデルIDが残存していないことを確認する。

```bash
grep -n "claude-3-haiku-20240307" apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts
```

期待される出力: （空行、0件）

### Task 5-4: HC-001 が Green になることを確認

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

期待される出力:

- HC-001 `should use claude-haiku-4-5 as health check model`: **PASS**
- 既存テスト全件: **PASS**

### Task 5-5: TypeScript コンパイル確認

```bash
pnpm --filter @repo/desktop typecheck
```

期待される出力: エラー0件

## 参照資料

| ドキュメント                                             | 用途                                  |
| -------------------------------------------------------- | ------------------------------------- |
| `phase-4-test-creation.md`                               | HC-001 の Red 状態確認（前提条件）    |
| `research/anthropic-models.md`                           | `claude-haiku-4-5` の正式モデルID確認 |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` | 変更対象ファイル                      |

## 統合テスト連携

本変更（1行置換）は Adapter 内部の完結した変更であり、Main Process の IPC ハンドラー・Preload・Renderer に影響しない。統合テストは Task04 が担当する。

## 成果物

| 成果物                        | パス                                                     | 備考                    |
| ----------------------------- | -------------------------------------------------------- | ----------------------- |
| AnthropicAdapter.ts（変更後） | `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` | L207 の model ID を更新 |

## 完了条件

- [ ] `AnthropicAdapter.ts` L207 の model が `"claude-haiku-4-5"` に変更されている
- [ ] `grep -n "claude-3-haiku-20240307" AnthropicAdapter.ts` の出力が 0 件である
- [ ] HC-001 テストが **PASS**（Green 状態）である
- [ ] 既存テスト全件（`ADP-008` / `ADP-009` / `ADP-010` / `streamChat` / その他 `checkHealth`）が **PASS** である
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー0件である
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
