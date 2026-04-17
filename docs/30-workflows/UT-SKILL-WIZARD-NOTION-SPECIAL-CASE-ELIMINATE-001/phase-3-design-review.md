# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 3                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 2                                           |
| 後続Phase  | Phase 4（PASS または MINOR の場合）               |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

Phase 2 の設計内容を多角的にレビューし、Phase 4（テスト作成）への進行可否を判定する。
PASS/MINOR/MAJOR のいずれかを決定し、MINOR の場合は追跡テーブルに記録する。

## 実行タスク

- 設計一貫性チェック: 型・定数・関数のシグネチャが矛盾なく整合しているか
- AC 整合チェック: 設計が AC-1〜AC-4 を全て満たしているか
- 後方互換性チェック: 戻り値型変更の影響範囲が管理可能か
- 命名規則チェック: 既存コードの命名パターンと一致しているか
- リスクチェック: 型拡張・フォールバック挙動に問題がないか
- MINOR 追跡テーブル: 指摘事項があれば記録

## 参照資料

| 資料名                    | パス                                                                          | 用途                 |
| ------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| Phase 1 成果物            | `outputs/phase-1/requirements-definition.md`                                  | 要件・AC参照         |
| Phase 2 成果物            | `outputs/phase-2/design.md`                                                   | 設計書参照           |
| skill-wizard-label-map.ts | `packages/shared/src/types/skill-wizard-label-map.ts`                         | 既存命名規則・型確認 |
| ConversationRoundStep.tsx | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 変更箇所確認         |

## 実行手順

### 1. 設計一貫性チェック

| チェック項目                                                                                        | 判定基準                  | 結果      |
| --------------------------------------------------------------------------------------------------- | ------------------------- | --------- |
| `SemanticLabelEntry` が `string \| { label: string; freeText?: string }` で定義されている           | TypeScript で型エラーなし | completed |
| `QuestionSemanticLabelMap` が `Record<string, Record<string, SemanticLabelEntry>>` に変更されている | 型定義の整合              | completed |
| `SemanticLabelResult` が `{ label: string; freeText?: string }` で定義されている                    | 戻り値型の明示            | completed |
| `SEMANTIC_LABEL_MAP` の `q5.notion` が `{ label: "その他", freeText: "Notion" }` になっている       | エントリ確認              | completed |
| `resolveLabelEntry()` の戻り値が `SemanticLabelResult \| undefined` になっている                    | 関数シグネチャの整合      | completed |
| `resolveSemanticLabel()` の戻り値が `string \| undefined` のまま維持されている                      | 後方互換の整合            | completed |
| string エントリのフォールバックが `{ label: entry }` を返す                                         | union型分岐ロジックの整合 | completed |
| `createQuestionAnswer()` が `result?.label` と `result?.freeText` を参照している                    | 呼び出し元修正の整合      | completed |

### 2. AC 整合チェック

| AC ID | 設計対応                                                                                                                                                | 充足判定  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| AC-1  | `SEMANTIC_LABEL_MAP` の `q5.notion` を `{ label: "その他", freeText: "Notion" }` に変更し、`resolveLabelEntry("notion", "q5")` がそのオブジェクトを返す | completed |
| AC-2  | `createQuestionAnswer()` の notion 特別ケース（L162〜L165）を削除し、`resolveLabelEntry()` の戻り値から `freeText` を取得する                           | completed |
| AC-3  | `resolveSemanticLabel()` の既存テストが全て通過するように、文字列契約を維持したまま実装する                                                             | completed |
| AC-4  | `SemanticLabelEntry`・`QuestionSemanticLabelMap`・`SemanticLabelResult` 型の追加後に `pnpm typecheck` が 0 error で通過する                             | completed |

### 3. 後方互換性チェック

```bash
# resolveSemanticLabel の全呼び出し元を確認（影響範囲の把握）
grep -rn "resolveSemanticLabel" apps/ packages/

# 既存テストでの resolveSemanticLabel 使用箇所確認
grep -rn "resolveSemanticLabel" packages/shared/src/types/__tests__/
```

| チェック項目                                                               | 判定基準                                  | 結果      |
| -------------------------------------------------------------------------- | ----------------------------------------- | --------- |
| `resolveSemanticLabel()` の呼び出し元が `ConversationRoundStep.tsx` のみか | grep 結果で影響範囲を確認                 | completed |
| 既存テストの修正が最小限（追加は `resolveLabelEntry()` 中心）か            | 既存テスト変更量の確認                    | completed |
| `createQuestionAnswer()` 以外の呼び出し元がある場合の対応方針              | 追加対応が必要な場合は MINOR/MAJOR に分類 | completed |

### 4. 命名規則チェック

```bash
# 既存の型命名パターン確認（PascalCase）
grep -n "^export type " packages/shared/src/types/skill-wizard-label-map.ts

# 既存の定数命名パターン確認（UPPER_SNAKE_CASE）
grep -n "^export const " packages/shared/src/types/skill-wizard-label-map.ts

# 既存の関数命名パターン確認（camelCase）
grep -n "^export function " packages/shared/src/types/skill-wizard-label-map.ts
```

| 確認項目                             | 期待パターン     | 結果      |
| ------------------------------------ | ---------------- | --------- |
| 型名 `SemanticLabelEntry`            | PascalCase       | completed |
| 型名 `SemanticLabelResult`           | PascalCase       | completed |
| 型名 `QuestionSemanticLabelMap`      | PascalCase       | completed |
| 定数名 `SEMANTIC_LABEL_MAP`          | UPPER_SNAKE_CASE | completed |
| 関数名 `resolveSemanticLabel`        | camelCase        | completed |
| オブジェクトキー `label`, `freeText` | camelCase        | completed |

### 5. リスクチェック

| リスク                                                           | 評価                                                                    | 対応                   |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------- |
| `SemanticLabelEntry` の union 型で TypeScript 型推論が複雑化する | `typeof entry === "string"` 分岐で明確に処理でき、推論に問題なし        | 設計で吸収済み         |
| `resolveLabelEntry()` 追加により shared テストが増える           | `resolveSemanticLabel()` は維持され、既存テスト影響は最小               | Phase 4 で対処         |
| `createQuestionAnswer()` のフォールバック挙動変更                | `freeText` が `""` の場合と `result?.freeText ?? ""` の場合で挙動が同一 | 問題なし               |
| notion 以外の q5 エントリ（slack, github）の変換が壊れる         | string エントリのフォールバック `{ label: entry }` で正常動作           | 設計で吸収済み         |
| `q5.notion` が `"その他"` のままの場合のフォールバック           | オブジェクトエントリに変更するため問題なし                              | SEMANTIC_LABEL_MAP更新 |

### 6. レビュー判定基準

| 判定  | 条件                                                             | 次のアクション         |
| ----- | ---------------------------------------------------------------- | ---------------------- |
| PASS  | 全チェック項目でリスクなし、AC-1〜AC-4 の設計対応が充足          | Phase 4 へ進む         |
| MINOR | 小さな指摘事項あり（実装時に並行解消可能）                       | Phase 4 へ進む（追跡） |
| MAJOR | 設計の根本的な問題（型設計の破綻・AC未充足・影響範囲が管理不能） | Phase 2 へ戻る         |

**MAJOR 判定となる条件の例**:

- `resolveSemanticLabel()` の呼び出し元が多数あり、全修正が本タスクスコープを超える
- `SemanticLabelEntry` の union 型が TypeScript の型チェックを通過しない
- AC-1〜AC-4 のいずれかを設計が満たせない構造的欠陥がある

**総合判定**: （実行時に PASS / MINOR / MAJOR を記録）

### 7. MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------- | -------- | ------------- | ------------- | ---- |
| （実行時に記録） | -        | -             | -             | -    |

### 8. Phase 4 開始条件

Phase 4（テスト作成）を開始できる条件:

- [ ] 総合判定が PASS または MINOR であること
- [ ] MAJOR 判定の場合は Phase 2 へ戻り再設計を行うこと
- [ ] MINOR の指摘事項が追跡テーブルに記録されていること

## 統合テスト連携【必須】

| 判定項目               | 基準    | 結果      |
| ---------------------- | ------- | --------- |
| 型チェック（設計段階） | PASS    | completed |
| lint                   | 0 error | completed |

## 多角的チェック観点

| 観点           | チェック内容                                                                           |
| -------------- | -------------------------------------------------------------------------------------- |
| 型設計妥当性   | `SemanticLabelEntry` の union 型が将来の拡張（他の freeText 付き変換）にも対応できるか |
| 最小変更原則   | 設計変更が本タスクのスコープ（notion 特別ケース解消）に限定されているか                |
| テスト設計適合 | Phase 4 でテストを書きやすい設計になっているか                                         |
| 依存整合       | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 の成果物と矛盾していないか          |

## 成果物

| 成果物           | パス                               | 説明                            |
| ---------------- | ---------------------------------- | ------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | PASS/MINOR/MAJOR 判定・指摘事項 |

## 完了条件

- [ ] 設計一貫性チェック（7項目）が完了
- [ ] AC-1〜AC-4 の設計対応が確認済み
- [ ] 後方互換性チェック（影響範囲確認）が完了
- [ ] 命名規則チェック（6項目）が完了
- [ ] リスクチェック（5項目）が完了
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 判定の指摘事項があれば追跡テーブルに記録済み
- [ ] Phase 4 開始条件（PASS or MINOR）が充足されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 設計一貫性チェック（7項目）
2. AC 整合チェック（AC-1〜AC-4）
3. 後方互換性チェック（grep による影響範囲確認）
4. 命名規則チェック
5. リスクチェック
6. 総合判定記録
7. MINOR 追跡テーブル記録（該当時）
8. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 4: テスト作成（PASS または MINOR の場合）
Phase 2: 設計（MAJOR の場合）
