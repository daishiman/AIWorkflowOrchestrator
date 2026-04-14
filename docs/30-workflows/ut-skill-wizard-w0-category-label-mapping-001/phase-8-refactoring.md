# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 8                                             |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 7                                       |
| 後続Phase  | Phase 9                                       |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

実装コードとテストコードを精査し、重複・命名ドリフト・品質上の問題を解消する。
小規模タスクのため大幅なリファクタは不要。確認中心で進める。

## 実行タスク

- コードレビュー: 実装コードの可読性・命名一貫性確認
- 重複排除確認: 類似定数・関数が他ファイルに存在しないか
- JSDocコメント品質確認: `SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel()` のコメント充足確認
- テストコード整理: テストケースの可読性・整理状況確認

## 参照資料

| 資料名         | パス                                                              | 用途               |
| -------------- | ----------------------------------------------------------------- | ------------------ |
| 実装ファイル   | `packages/shared/src/types/skillCreator.ts`                       | コードレビュー対象 |
| テストファイル | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | テストコード確認   |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`                              | カバレッジ確認     |

## 実行手順

### 1. 実装コードレビュー

```bash
# 実装コードの確認
grep -n -A 20 "SKILL_CATEGORY_LABELS" packages/shared/src/types/skillCreator.ts
```

**チェックリスト**:

| 確認項目                                   | 期待値                   | 結果    |
| ------------------------------------------ | ------------------------ | ------- |
| 定数名が UPPER_SNAKE_CASE                  | `SKILL_CATEGORY_LABELS`  | pending |
| 関数名が camelCase                         | `getSkillCategoryLabel`  | pending |
| JSDocコメントが存在する                    | `/**` から始まるコメント | pending |
| `as const` アサーションが付与されている    | `} as const;`            | pending |
| `Record<SkillCategory, string>` 型注釈あり | 型注釈が存在             | pending |

### 2. 重複排除確認

```bash
# 類似定数・関数の存在確認
grep -rn "CategoryLabel\|CATEGORY_LABEL" packages/ apps/ --include="*.ts"

# 関連する翻訳/ラベル定数パターンの確認
grep -rn "Record<SkillCategory" packages/ apps/ --include="*.ts"
```

### 3. リファクタリング記録【`[Feedback RT-03]` 対応: Before/After/理由テーブル】

| 対象             | Before | After | 理由 |
| ---------------- | ------ | ----- | ---- |
| （実行時に記録） | -      | -     | -    |

小規模タスクのため、リファクタリングが不要な場合は「変更なし」として記録する。

### 4. テストコード整理確認

```bash
# テストファイルの構造確認
grep -n "describe\|it(" packages/shared/src/types/__tests__/skillCreator-wizard.test.ts
```

**確認ポイント**:

- `describe` ブロックの分類が適切か（`SKILL_CATEGORY_LABELS` / `getSkillCategoryLabel` / edge cases）
- テスト名が英語で意味が明確か
- `[Feedback W0-RV-001]` の `// length: N` コメントが付与されているか

### 5. バリデーション再実行

```bash
# リファクタ後のテスト再実行
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts

# 型チェック再確認
pnpm --filter @repo/shared typecheck
```

## 統合テスト連携【必須】

| 判定項目                     | 基準    | 結果    |
| ---------------------------- | ------- | ------- |
| 全テストPASS（リファクタ後） | PASS    | pending |
| 型チェック                   | PASS    | pending |
| lint                         | 0 error | pending |

## 成果物

| 成果物               | パス                                 | 説明                                    |
| -------------------- | ------------------------------------ | --------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | Before/After/理由テーブル・変更なし記録 |

## 完了条件

- [ ] 実装コードのレビュー完了（命名・JSDoc・型注釈）
- [ ] 重複排除確認完了（重複なし確認 or 重複解消）
- [ ] リファクタリング記録（Before/After/理由テーブル）を作成済み
- [ ] テストコード整理確認完了
- [ ] リファクタ後のテスト・型チェックが全PASS
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 実装コードレビュー（命名・JSDoc・型注釈）
2. 重複排除確認
3. リファクタリング記録
4. テストコード整理確認
5. バリデーション再実行

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
