# Phase 8: リファクタリング - GoogleAdapter system_instruction 対応（TDD: Refactor）

## メタ情報

| 項目     | 値                                  |
| -------- | ----------------------------------- |
| Phase    | 8                                   |
| 機能名   | google-adapter-system-instruction   |
| 作成日   | 2026-03-23                          |
| タスクID | TASK-LLM-MOD-03                     |
| 依存     | phase-7-coverage.md（PASS判定済み） |

## 目的

TDD の Refactor フェーズとして、Green を維持しながらコードの可読性・保守性を改善する。機能は変更しない。

## 実行タスク

### Task 8-1: リファクタリング対象の特定

Phase 5 実装後のコードを確認し、改善すべき箇所を特定する。

```bash
cat apps/desktop/src/main/adapters/llm/GoogleAdapter.ts
```

**確認観点**:

1. JSDoc コメントが `buildRequestBody` の動作を正確に説明しているか
2. `formatContents` のコメントが変更後の動作を反映しているか（旧コメント「Geminiはsystem roleを直接サポートしないため...」が残っていないか）
3. 不要な変数宣言・コメントが残っていないか
4. `system_instruction` の型定義をインラインで記述しているが、可読性に問題がないか

### Task 8-2: JSDoc コメントの更新

**`formatContents` のコメント更新**:

```typescript
// 変更前（旧ワークアラウンドのコメントが残っている場合）
/**
 * メッセージをGemini API形式に変換
 * Geminiはsystem roleを直接サポートしないため、
 * userロールでシステムプロンプトを追加
 */

// 変更後
/**
 * 会話メッセージを Gemini API の contents 形式に変換する
 * systemPrompt は buildRequestBody で system_instruction フィールドとして設定するため、
 * 本メソッドは request.messages のみを変換する
 */
```

**`buildRequestBody` の JSDoc 確認・更新**:

Phase 5 で追加した JSDoc が以下を含んでいることを確認する:

- メソッドの目的（リクエストボディの構築）
- `system_instruction` が条件付きで追加されること
- 戻り値の型（`Record<string, unknown>`）の説明

### Task 8-3: 不要コードの確認・削除

以下を `grep` で確認し、残存していれば削除する。

```bash
# 旧ワークアラウンドのコメントが残っていないか確認
grep -n "system role\|ワークアラウン\|userロールでシステム" \
  apps/desktop/src/main/adapters/llm/GoogleAdapter.ts

# 空行・コメントの過不足確認
grep -n "^\s*$" apps/desktop/src/main/adapters/llm/GoogleAdapter.ts | wc -l
```

### Task 8-4: non-null assertion チェック（P48・P52 対策）

```bash
grep -n "!" apps/desktop/src/main/adapters/llm/GoogleAdapter.ts
```

`!` が含まれる行を全件確認し、non-null assertion が存在する場合は optional chaining / 実行時チェックに置き換える。

### Task 8-5: リファクタリング後のテスト確認

リファクタリング後に全テストが Green であることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

**期待する結果**: 全テスト PASS（リファクタリングで機能を変えていないため）。

### Task 8-6: リファクタリング対象外の判断記録

以下は意図的にリファクタリングしない:

| 項目                                                      | 理由                                                   |
| --------------------------------------------------------- | ------------------------------------------------------ |
| `buildRequestBody` の戻り値型 `Record<string, unknown>`   | 本タスクスコープ内では適切。厳密な型定義は未タスク候補 |
| `GeminiGenerateContentResponse` インターフェース          | 変更対象外。現状のまま正しく機能している               |
| エラーハンドリング（`isLLMError` / `handleNetworkError`） | `BaseLLMAdapter` の共通実装。変更対象外                |

## 参照資料

| 資料名           | パス                                                  | 内容                     |
| ---------------- | ----------------------------------------------------- | ------------------------ |
| 実装済みコード   | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts` | リファクタリング対象     |
| コード品質ルール | `.claude/rules/02-code-quality.md`                    | 型安全・コーディング規約 |

## 成果物

| 成果物                   | パス                                                  | 説明                             |
| ------------------------ | ----------------------------------------------------- | -------------------------------- |
| リファクタリング済み実装 | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts` | コメント更新・不要コード削除済み |

## 完了条件

- [ ] `formatContents` の JSDoc コメントが変更後の動作を正確に説明している
- [ ] `buildRequestBody` の JSDoc コメントが存在し、動作・条件を説明している
- [ ] 旧ワークアラウンドのコメント（「Geminiはsystem roleを直接サポートしないため...」等）が削除されている
- [ ] non-null assertion (`!`) が存在しないことを確認している
- [ ] リファクタリング後も全テストが PASS している

## 統合テスト連携

リファクタリングによる機能変更はゼロであることを確認する。Phase 9 の品質検証でコンパイルエラー・Lint 違反がないことも確認する。

## 次のPhase

Phase 9: 品質保証
