# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 8                                  |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI      |
| 作成日   | 2026-03-23                         |
| 前提     | Phase 7 完了（カバレッジ基準充足） |

## 目的

機能的に正しく動作するコードの品質を向上させる。重複排除、命名改善、コンポーネント分割の最適化を行う。

## 実行タスク

### Task 1: IPC ハンドラのリファクタリング

1. **suggestion バリデーションの関数抽出**: `creatorHandlers.ts` 内の suggestion 配列バリデーションロジックを独立関数 `validateSuggestions()` に抽出する
2. **型ガード関数の追加**: `isSuggestion(value: unknown): value is RuntimeSkillCreatorImproveSuggestion` 型ガード関数を作成し、`in` 演算子で実行時検証する（P49 準拠: `as` キャスト禁止）

```typescript
function isSuggestion(
  value: unknown,
): value is RuntimeSkillCreatorImproveSuggestion {
  return (
    value != null &&
    typeof value === "object" &&
    "section" in value &&
    typeof value.section === "string" &&
    "before" in value &&
    typeof value.before === "string" &&
    "after" in value &&
    typeof value.after === "string" &&
    "reason" in value &&
    typeof value.reason === "string"
  );
}
```

### Task 2: Renderer コンポーネントのリファクタリング

1. **共通スタイル定数の統合**: `diffStyles` を `ImprovementProposalItem.tsx` から分離して `improvementStyles.ts` に集約する（テスト・コンポーネント両方から import 可能にする）
2. **チェックボックスコンポーネント**: チェックボックス + ラベルのパターンが `SuggestionList.tsx` と重複する場合、atoms レベルの共通コンポーネント抽出を検討する
3. **コードブロックコンポーネント**: diff 表示の before/after ブロックを `DiffBlock` atoms コンポーネントとして抽出する

### Task 3: コード品質チェック

- [ ] `any` 型が使用されていない
- [ ] `@ts-ignore` / `@ts-expect-error` が使用されていない
- [ ] `as` キャストによるバリデーションバイパスがない（P19/P49 準拠）
- [ ] 未使用の import がない
- [ ] boolean 変数が `is` / `has` / `can` / `should` プレフィックスを使用している
- [ ] `React.memo` と `displayName` が全コンポーネントに設定されている

### Task 4: テスト再実行

リファクタリング後に全テストが PASS することを確認する:

```bash
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/creatorHandlers.applyImprovement.test.ts \
  src/renderer/components/skill/__tests__/ImprovementProposal*.test.tsx \
  src/renderer/components/skill/__tests__/ImprovementApplyResult.test.tsx
```

## 参照資料

- `.claude/rules/02-code-quality.md`（コーディング規約）
- `.claude/rules/06-known-pitfalls.md` P49（type predicate 内の `as` キャスト禁止）

## 成果物

- リファクタリング済みの全対象ファイル
- `apps/desktop/src/renderer/components/skill/improvementStyles.ts`（新規: 必要な場合）

## 完了条件

- [ ] suggestion バリデーションが独立関数に抽出されている
- [ ] 型ガード関数が `in` 演算子ベースで実装されている（P49 準拠）
- [ ] diff 表示スタイルが共通ファイルに集約されている
- [ ] コード品質チェック全項目が確認されている
- [ ] リファクタリング後に全テストが PASS する
- [ ] カバレッジが Phase 7 の基準値を維持している

## 次の Phase

Phase 9: 品質検証
