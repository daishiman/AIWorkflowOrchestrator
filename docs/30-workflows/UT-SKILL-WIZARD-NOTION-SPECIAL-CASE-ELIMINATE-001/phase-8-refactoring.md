# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 8                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 7                                           |
| 後続Phase  | Phase 9                                           |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

実装コードとテストコードを精査し、重複・命名ドリフト・品質上の問題を解消する。
小規模タスクのため必要最低限のリファクタリングのみ実施し、確認中心で進める。

## 実行タスク

- コードレビュー: 実装コードの可読性・命名一貫性確認
- コメント整理: notion 特別ケース削除後のコメント更新
- 型定義命名の一貫性確認: `SemanticLabelEntry` / `QuestionSemanticLabelMap` の統一確認
- 重複排除確認: 類似関数・型が他ファイルに存在しないか確認
- テストコード整理: テストケースの可読性・グループ化の確認

## 参照資料

| 資料名         | パス                                                                          | 用途               |
| -------------- | ----------------------------------------------------------------------------- | ------------------ |
| 型定義ファイル | `packages/shared/src/types/skill-wizard-label-map.ts`                         | コードレビュー対象 |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | コメント整理対象   |
| テストファイル | `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts`          | テストコード確認   |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`                                          | カバレッジ結果確認 |

- 依存Phase参照: Phase 1 の要件定義書、Phase 2 の設計書（`outputs/phase-1/requirements-definition.md` / `outputs/phase-1/acceptance-criteria.md` / `outputs/phase-2/design.md`）を前提にする

## 実行手順

### 1. 実装コードレビュー（`skill-wizard-label-map.ts`）

**チェックリスト**:

| 確認項目                                       | 期待値                     | 結果      |
| ---------------------------------------------- | -------------------------- | --------- |
| `SemanticLabelEntry` 型名が PascalCase         | `SemanticLabelEntry`       | completed |
| `QuestionSemanticLabelMap` 型名が PascalCase   | `QuestionSemanticLabelMap` | completed |
| `resolveLabelEntry` 関数名が camelCase         | `resolveLabelEntry`        | completed |
| `resolveSemanticLabel` 関数名が camelCase      | `resolveSemanticLabel`     | completed |
| `SEMANTIC_LABEL_MAP` 定数名が UPPER_SNAKE_CASE | `SEMANTIC_LABEL_MAP`       | completed |
| JSDoc コメントが全エクスポートに存在する       | `/**` から始まるコメント   | completed |
| `q5.notion` エントリのコメントが更新済み       | 特別ケース言及が削除済み   | completed |

### 2. コメント整理（`ConversationRoundStep.tsx`）

notion 特別ケース削除後、以下のコメントが残存していないことを確認する。

**削除済みであるべきコメント**:

```typescript
// notion は "その他" へマップし、freeText に "Notion" を保持する特別ケース。
// resolveSemanticLabel 単体では freeText の設定ができないため先行チェックする。
```

**更新後のコメント方針**: `resolveLabelEntry()` を使用する旨を JSDoc または inline コメントで記載する。

```bash
# 削除済みコメントの残存確認
grep -n "特別ケース\|先行チェック\|notion.*freeText" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
# 期待: 出力なし（コメント削除済み）
```

### 3. 型定義命名の一貫性確認

```bash
# SemanticLabelEntry / QuestionSemanticLabelMap の使用箇所を確認
grep -rn "SemanticLabelEntry\|QuestionSemanticLabelMap\|resolveLabelEntry" \
  packages/shared/src/ apps/desktop/src/ --include="*.ts" --include="*.tsx"
```

確認ポイント:

- 型名・関数名が全ファイルで統一されているか
- import 文が正しいパスを参照しているか
- 型の別名定義（alias）が重複していないか

### 4. 重複排除確認

```bash
# 類似型・関数の存在確認
grep -rn "LabelEntry\|LabelMap\|resolveSemantic\|resolveLabel" \
  packages/ apps/ --include="*.ts" --include="*.tsx"

# SemanticLabelEntry に類似した union 型の確認
grep -rn "label.*freeText\|freeText.*label" \
  packages/ apps/ --include="*.ts" --include="*.tsx"
```

### 5. リファクタリング記録

| 対象             | Before | After | 理由 |
| ---------------- | ------ | ----- | ---- |
| （実行時に記録） | -      | -     | -    |

> 小規模タスクのため、リファクタリングが不要な場合は「変更なし」として記録する。

### 6. テストコード整理確認

```bash
# テストファイルの describe / it 構造確認
grep -n "describe\|it(" \
  packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts
```

**確認ポイント**:

- `describe` ブロックの分類が適切か（`resolveLabelEntry` / `resolveSemanticLabel` / edge cases）
- テスト名が英語で意味が明確か
- Phase 4 テストと Phase 6 追加テストが見やすい単位でグループ化されているか

### 7. バリデーション再実行

```bash
# リファクタ後のテスト再実行
pnpm --filter @repo/shared exec vitest run \
  src/types/__tests__/skill-wizard-label-map.test.ts

# 型チェック再確認
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# lint 再確認
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint
```

## 統合テスト連携【必須】

| 判定項目                      | 基準    | 結果      |
| ----------------------------- | ------- | --------- |
| 全テスト PASS（リファクタ後） | PASS    | completed |
| 型チェック（shared）          | PASS    | completed |
| 型チェック（desktop）         | PASS    | completed |
| lint（shared）                | 0 error | completed |
| lint（desktop）               | 0 error | completed |

## 多角的チェック観点

| 観点     | 確認内容                                                                     |
| -------- | ---------------------------------------------------------------------------- |
| 矛盾     | リファクタリングによって Phase 5 実装の動作仕様が変わっていないか            |
| 漏れ     | notion 特別ケースのコメントが `ConversationRoundStep.tsx` に残存していないか |
| 整合性   | `SemanticLabelEntry` 型の命名が全参照箇所で統一されているか                  |
| 依存関係 | リファクタリング後も `resolveSemanticLabel()` の後方互換が維持されているか   |

## 成果物

| 成果物               | パス                                 | 説明                                    |
| -------------------- | ------------------------------------ | --------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | Before/After/理由テーブル・変更なし記録 |

## 完了条件

- [ ] 実装コードのレビュー完了（命名・JSDoc・型注釈）
- [ ] notion 特別ケース削除後のコメント更新済み（残存コメントなし）
- [ ] 型定義命名の一貫性確認完了（`SemanticLabelEntry` / `QuestionSemanticLabelMap`）
- [ ] 重複排除確認完了（重複なし確認 or 重複解消）
- [ ] リファクタリング記録（Before/After/理由テーブル）を作成済み
- [ ] テストコード整理確認完了
- [ ] リファクタ後のテスト・型チェック・lint が全 PASS
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 実装コードレビュー（命名・JSDoc・型注釈）
2. コメント整理（特別ケース削除後）
3. 型定義命名の一貫性確認
4. 重複排除確認
5. リファクタリング記録
6. テストコード整理確認
7. バリデーション再実行

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
