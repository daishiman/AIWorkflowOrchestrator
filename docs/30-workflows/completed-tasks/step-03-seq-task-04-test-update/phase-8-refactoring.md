# Phase 8: リファクタリング — テスト期待値更新

## メタ情報

| 項目      | 値                      |
| --------- | ----------------------- |
| Phase番号 | 8                       |
| 機能名    | test-update             |
| タスクID  | TASK-LLM-MOD-04         |
| 作成日    | 2026-03-23              |
| 前Phase   | Phase 7: カバレッジ確認 |
| 次Phase   | Phase 9: 品質保証       |

## 目的

Phase 5 / 6 で追加・変更したテストコードの可読性・保守性を改善する。機能に影響するリファクタリングは行わない。

## 実行タスク

### Task 8-1: テストコードの重複確認

Phase 5 / 6 で追加したテストケースで、以下のパターンが重複していないか確認する:

```bash
# モックセットアップの重複確認
grep -n "mockFetch\|vi.mock\|beforeEach" apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

重複する beforeEach のモック設定がある場合は、既存の describe 階層の beforeEach に統合する。

### Task 8-2: 期待値の定数化確認

モデルIDの文字列リテラルが複数テストで繰り返し使用されている場合、定数化を検討する:

```typescript
// 定数化の例（既存のパターンに合わせる）
const HEALTH_CHECK_MODEL = "claude-haiku-4-5";

it("should use health check model", () => {
  expect(request.model).toBe(HEALTH_CHECK_MODEL);
});
```

ただし、プロジェクトの既存テストが定数化していない場合は統一性のためにそのままにする。

### Task 8-3: テストコードの命名規則確認

追加した it / describe の説明文が既存のスタイルに一致しているか確認する:

- 既存テストが `"should return ..."` 形式なら同形式を使用
- 既存テストが `"returns ..."` 形式なら同形式を使用

```bash
# 既存の命名スタイル確認
grep -n "it(\"" apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts | head -10
grep -n "it(\"" apps/desktop/src/main/handlers/__tests__/llm.test.ts | head -10
```

### Task 8-4: 不要なコメントの除去

Phase 5 実装時に追加した作業メモ（`// TODO:`, `// FIXME:`, `// 一時的に:` など）がある場合は除去する。

### Task 8-5: リファクタリング後のテスト実行

リファクタリング後も全テストが PASS することを確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/
```

## 参照資料

| 資料                                     | 用途                           |
| ---------------------------------------- | ------------------------------ |
| `phase-5-implementation.md`              | 変更済みテストファイルの一覧   |
| `.claude/rules/02-code-quality.md`       | コーディング規約（命名規則等） |
| `.claude/rules/06-known-pitfalls.md#P40` | テスト実行ディレクトリ確認     |

## 統合テスト連携

リファクタリング後に `cd apps/desktop && pnpm vitest run` を再実行し、PASS 件数が変化していないことを確認する。

## 成果物

| 成果物                             | パス                                 |
| ---------------------------------- | ------------------------------------ |
| リファクタリング済みテストファイル | 変更があった場合: 対象テストファイル |

## P50 適用記録

> Task01-03 実装時にテスト更新が同時完了していたことを Phase 5 事前確認で発見。
> 「検証・補完モード」に切り替え、変更0行で全要件充足を確認した。

## 完了条件

- [x] P50 パターン適用: Task01-03 完了時にテスト更新済みであることを確認（変更0行）
- [ ] モックセットアップの重複が解消されている（または重複なしを確認した）
- [ ] テストケースの命名スタイルが既存に統一されている
- [ ] 不要な作業コメントが除去されている
- [ ] リファクタリング後も `cd apps/desktop && pnpm vitest run` が PASS する

## 次のPhase

Phase 9: 品質保証 (`phase-9-quality-assurance.md`)
