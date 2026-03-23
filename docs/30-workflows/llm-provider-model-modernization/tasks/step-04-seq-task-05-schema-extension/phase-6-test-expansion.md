# Phase 6: テスト拡充 — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値               |
| --------- | ---------------- |
| Phase番号 | 6                |
| 機能名    | schema-extension |
| タスクID  | TASK-LLM-MOD-05  |
| 作成日    | 2026-03-23       |
| 依存Phase | Phase 5（実装）  |

## 目的

Phase 7 のカバレッジ確認で不足が判明した場合に補完するテストを追加する。本タスクは変更量が少ないため、Phase 4 のテストで十分なカバレッジが達成されていれば本Phaseの作業量は最小限になる。

## 実行タスク

### Task 6-1: カバレッジ未達箇所の特定

Phase 7 の事前確認として、以下のコマンドで現在のカバレッジを確認する:

```bash
pnpm --filter @repo/shared exec vitest run --coverage src/types/llm/schemas/__tests__/provider.test.ts
pnpm --filter @repo/desktop exec vitest run --coverage src/main/handlers/__tests__/llm.test.ts
```

**確認する観点:**

- `provider.ts` の `LLMModelSchema` の全分岐がカバーされているか
- `llm.ts` の `handleGetProviders()` の全パス（APIキーあり・なし）がテストされているか

### Task 6-2: 追加テスト候補

Phase 4 でカバーされなかった場合に追加するテスト候補を以下に列挙する:

| テストID | 説明                                                                                                 | 追加対象ファイル   | 優先度                              |
| -------- | ---------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------- |
| TS-C-01  | LLMProviderSchema で description を持つモデルを含むプロバイダーがバリデーションを通ること            | `provider.test.ts` | 低（既存TS-002-02で類似カバー済み） |
| TS-C-02  | handleGetProviders が APIキーなしの場合に isAvailable: false として description ありモデルを返すこと | `llm.test.ts`      | 中                                  |
| TS-C-03  | LLMModelSchema の description フィールドが 30文字を超えても通ること（上限なし確認）                  | `provider.test.ts` | 低                                  |

### Task 6-3: テスト間の状態漏れ確認

`beforeEach` で SecureStorage のモックがリセットされていることを確認する（P9対策）。

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // または SecureStorage.getApiKey のモックをリセット
});
```

### Task 6-4: 追加テストの実装

カバレッジ不足が確認された場合のみ、Task 6-2 の候補から必要なものを実装する。

実装優先度:

1. TS-C-02（handleGetProviders の isAvailable: false パス）
2. その他は Phase 7 確認後に判断

## 参照資料

| 資料                                                               | 用途                                 |
| ------------------------------------------------------------------ | ------------------------------------ |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` | 既存テストのカバレッジ確認           |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts`             | 既存テストのカバレッジ確認           |
| `.claude/rules/02-code-quality.md`（カバレッジ基準）               | 最低基準（Line 80%、Branch 60%）確認 |

## 成果物

| 成果物               | パス                                                               | 備考                         |
| -------------------- | ------------------------------------------------------------------ | ---------------------------- |
| 拡充テスト（必要時） | `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` | カバレッジ不足の場合のみ追加 |
| 拡充テスト（必要時） | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`             | カバレッジ不足の場合のみ追加 |

## 統合テスト連携

Phase 6 で追加するテストは Phase 7 のカバレッジ確認の入力となる。Phase 4 のテストで基準を達成していれば、Phase 6 の追加は最小限でよい。

## 完了条件

- [ ] Phase 4 のテストカバレッジを確認した（`vitest run --coverage`）
- [ ] カバレッジ基準（Line 80%、Branch 60%、Function 80%）を達成しているかを判定した
- [ ] 不足している場合は Task 6-2 の候補から適切なテストを追加した
- [ ] 追加したテストが全件 PASS であることを確認した
- [ ] `beforeEach` でモック状態がリセットされていることを確認した（P9対策）

## 次のPhase

[Phase 7: カバレッジ確認](./phase-7-coverage.md)
