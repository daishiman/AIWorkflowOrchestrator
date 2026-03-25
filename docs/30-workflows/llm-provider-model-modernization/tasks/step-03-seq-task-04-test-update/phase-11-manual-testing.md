# Phase 11: 手動テスト — テスト期待値更新

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase番号 | 11                     |
| 機能名    | test-update            |
| タスクID  | TASK-LLM-MOD-04        |
| 作成日    | 2026-03-23             |
| 前Phase   | Phase 10: 最終レビュー |
| 次Phase   | Phase 12: ドキュメント |

## 目的

自動テストでは検出できないシナリオを手動で確認し、テスト更新の品質を最終確認する。このタスクはテスト更新のみを扱うため、手動テストのスコープは限定的である。

## 実行タスク

### Task 11-1: テストファイルの最終目視確認

自動実行ではなく、変更内容を目視でレビューする:

#### 確認項目 A: llm.test.ts

- [ ] handleGetProviders のモデルID期待値が PROVIDER_CONFIGS と一致していることを目視確認する
- [ ] inferProviderId("o3") / inferProviderId("o4-mini") のテストが存在することを確認する

```bash
grep -n "o3\|o4-mini" apps/desktop/src/main/handlers/__tests__/llm.test.ts
```

#### 確認項目 B: AnthropicAdapter.test.ts

- [ ] ヘルスチェックの model 期待値が `"claude-haiku-4-5"` になっていることを目視確認する

```bash
grep -n "claude-haiku-4-5\|healthCheck" apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

#### 確認項目 C: GoogleAdapter.test.ts

- [ ] system_instruction テスト（T-03 / T-04）が存在することを目視確認する

```bash
grep -n "system_instruction\|systemPrompt" apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

### Task 11-2: テスト実行結果の最終確認

```bash
# 全テストの最終実行（apps/desktop から）
cd apps/desktop && pnpm vitest run 2>&1 | tail -20
```

出力の最終行で以下を確認する:

- `Tests X passed` の件数が Phase 5 実装前より増加していること（新規追加分）
- `Tests 0 failed` であること

### Task 11-3: 変更ファイル一覧の最終確認

```bash
git diff --name-only
```

このタスクのスコープ外のファイルが変更されていないことを確認する。
スコープ外ファイルが変更されている場合は、意図的な変更かどうかを確認する。

### Task 11-4: CLI 環境制約の記録

このタスクは CLI 環境での実行を前提とする。Electron アプリの実画面確認は対象外。
スクリーンショット取得が必要な場合は P53 参照（CLI 環境でのスクリーンショット取得制約）。

## 参照資料

| 資料                                     | 用途                               |
| ---------------------------------------- | ---------------------------------- |
| `phase-10-final-review.md`               | 最終レビュー結果                   |
| `.claude/rules/06-known-pitfalls.md#P53` | CLI 環境でのスクリーンショット制約 |

## 統合テスト連携

Task 11-2 の全テスト実行が最終的な受入基準（R-05: 全テスト PASS）を満たすことを証明する。

## 成果物

| 成果物                       | パス                         |
| ---------------------------- | ---------------------------- |
| 手動テスト記録（本ファイル） | `phase-11-manual-testing.md` |

## 完了条件

- [ ] 確認項目 A: llm.test.ts の期待値とテスト追加を目視確認した
- [ ] 確認項目 B: AnthropicAdapter.test.ts のヘルスチェック期待値を目視確認した
- [ ] 確認項目 C: GoogleAdapter.test.ts の system_instruction テストを目視確認した
- [ ] 最終テスト実行で全 PASS を確認した
- [ ] git diff でスコープ外ファイルが変更されていないことを確認した

## 次のPhase

Phase 12: ドキュメント (`phase-12-documentation.md`)
