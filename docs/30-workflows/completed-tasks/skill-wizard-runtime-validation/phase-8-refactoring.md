# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase番号  | 8                                                 |
| Phase名    | リファクタリング                                  |
| 前提Phase  | Phase 7                                           |
| 後続Phase  | Phase 9                                           |
| ステータス | 未実施                                            |
| 作成日     | 2026-04-08                                        |
| 機能名     | skill-wizard-runtime-validation                   |
| Issue      | #1999 (UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001) |

---

## 目的

duplicate・naming drift を削る。実装後の重複・命名ドリフトを是正する。

TDD の Green フェーズ（Phase 5）では「テストを通すこと」を最優先にした最小実装を行った。Phase 8 では、その実装を振り返り、可読性・保守性・命名一貫性の観点で改善できる箇所を特定してリファクタリングする。リファクタリング後も全テストが PASS していることを確認する。

---

## 実行タスク

### タスク1: コードレビュー（重複・命名ドリフト確認）

**目的**: 実装ファイルを精査し、リファクタリング候補を特定する。

**対象ファイル**:

- `packages/shared/src/types/skillInfoFormValidation.ts`
- `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts`

**実行手順**:

1. 実装ファイルを開き、以下の観点でレビューする:

**レビュー観点チェックリスト**:

| 観点        | 確認内容                                                                                          | 確認済み |
| ----------- | ------------------------------------------------------------------------------------------------- | -------- |
| 重複コード  | 同じロジック（trim・length チェック等）が複数箇所に存在しないか                                   | [ ]      |
| 命名一貫性  | 変数名・関数名が設計済みインターフェースと一致しているか                                          | [ ]      |
| 定数参照    | エラーメッセージがハードコードされていないか（`SKILL_INFO_VALIDATION_MESSAGES` を参照しているか） | [ ]      |
| 型定義      | `any` 型が使用されていないか                                                                      | [ ]      |
| 単一責任    | 各関数が単一のバリデーション責務のみを持っているか                                                | [ ]      |
| export 漏れ | 必要な型・定数・関数が全て `export` されているか                                                  | [ ]      |
| 不要コード  | 使われていない変数・コメント・デッドコードがないか                                                | [ ]      |

2. テストファイルを開き、以下の観点でレビューする:

| 観点             | 確認内容                                                              | 確認済み |
| ---------------- | --------------------------------------------------------------------- | -------- |
| テスト命名       | `it`/`test` の説明文が日本語で明確か                                  | [ ]      |
| マジックナンバー | 文字数（100, 500, 10 等）がインラインで使われていないか（定数化推奨） | [ ]      |
| 重複フィクスチャ | 同じ文字列生成（`"あ".repeat(500)` 等）が複数箇所に存在しないか       | [ ]      |
| `describe` 構造  | 関数ごとに `describe` ブロックが分かれているか                        | [ ]      |

**期待成果物**: レビュー結果（変更記録テーブルに反映）

---

### タスク2: 必要に応じてリファクタリング

**目的**: タスク1で特定した問題点を修正する。

**実行手順**:

1. リファクタリング候補を優先度順に整理する
2. 各変更を以下の変更記録テーブルに記録する
3. 変更を実施する
4. 変更後にテストを実行して Green を維持していることを確認する

---

#### 変更記録テーブル

| 対象                                       | Before | After | 理由 |
| ------------------------------------------ | ------ | ----- | ---- |
| （変更があれば記載、なければ「変更なし」） |        |       |      |

**記載例（変更がある場合）**:

| 対象                                              | Before                                                                    | After                                                 | 理由                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| `skillInfoFormValidation.ts` 内のエラーメッセージ | `"スキル名を入力してください"` (ハードコード)                             | `SKILL_INFO_VALIDATION_MESSAGES.skillName.required`   | 定数の一元管理。メッセージ変更時の修正箇所を1か所に限定 |
| `validateSkillInfoForm` の戻り値型                | `{ skillName?: string; purpose?: string; isValid: boolean }` (インライン) | 名前付き型 `SkillInfoFormValidationResult`            | 再利用性・可読性向上                                    |
| `validateSkillInfoForm` の入力型                  | `{ skillName?: string; purpose?: string; }` (インライン)                  | 名前付き型 `SkillInfoValidationInput`                 | `category` を型で除外し I/O 境界を明確化                |
| フィールド単位の結果型                            | 汎用名 `ValidationResult`                                                 | 専用名 `SkillInfoFieldValidationResult`               | `slideSettings.ts` の `ValidationResult` との衝突回避   |
| 文字数制限                                        | `100 / 10 / 500` (インライン)                                             | `SKILL_INFO_VALIDATION_LIMITS`                        | magic number 排除と定数の集約                           |
| 公開エクスポート                                  | なし                                                                      | `packages/shared/src/types/index.ts` へ再エクスポート | package consumers からの利用導線を維持                  |

**注意**: 実際の変更内容は実装後のコードを見て判断する。上記はあくまで記載例である。

---

### タスク3: リファクタリング後テスト再実行（全件PASS確認）

**目的**: リファクタリングによる回帰がないことを確認する。

**実行手順**:

1. テストを実行する:
   ```bash
   pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts
   ```
2. 全テストケースが PASS していることを確認する
3. TypeScript 型チェックを実行する:
   ```bash
   pnpm --filter @repo/shared typecheck
   ```
4. カバレッジが Phase 7 の目標値（Line 95%以上・Branch 90%以上）を維持していることを確認する:
   ```bash
   pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts --coverage
   ```
   ※ coverage はワークスペース全体の閾値で non-zero 終了になる場合がある。結果は `skillInfoFormValidation.ts` の coverage table を基準に確認する。
5. 実行結果を `outputs/phase-8/refactoring-result.md` に記録する

**期待される出力例**:

```
PASS packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts
  validateSkillName
    ✓ ...（全テスト PASS）
  validatePurpose
    ✓ ...
  validateSkillInfoForm
    ✓ ...

Test Files  1 passed (1)
Tests       22 passed (22)
```

**期待成果物**: `outputs/phase-8/refactoring-result.md`

---

## リファクタリング原則

リファクタリングは以下の原則に従って実施する:

| 原則             | 説明                                                           |
| ---------------- | -------------------------------------------------------------- |
| テストを壊さない | リファクタリング中・後に全テストが PASS であること             |
| 機能を変えない   | 外部から見た振る舞いを変えない（入出力インターフェースを維持） |
| 小さなステップ   | 一度に大きく変更せず、変更ごとにテストを実行する               |
| 記録する         | 変更内容・理由を変更記録テーブルに必ず記録する                 |

---

## 参照資料

| 資料名                     | パス / URL                                                            | 参照目的                     |
| -------------------------- | --------------------------------------------------------------------- | ---------------------------- |
| 実装ファイル               | `packages/shared/src/types/skillInfoFormValidation.ts`                | リファクタリング対象         |
| テストファイル             | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | 回帰確認                     |
| 設計済みインターフェース   | Issue #1999 本文                                                      | 命名・型の正解確認           |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`                                  | リファクタリング後の比較基準 |
| 実装結果記録               | `outputs/phase-5/implementation-result.md`                            | Phase 5 成果物               |
| Green確認記録              | `outputs/phase-5/green-confirmation.md`                               | Phase 5 成果物               |

---

## 成果物テーブル

| 成果物                           | パス                                                                  | 種別                   |
| -------------------------------- | --------------------------------------------------------------------- | ---------------------- |
| リファクタリング結果記録         | `outputs/phase-8/refactoring-result.md`                               | ドキュメント           |
| 実装ファイル（更新がある場合）   | `packages/shared/src/types/skillInfoFormValidation.ts`                | コード（条件付き更新） |
| テストファイル（更新がある場合） | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | コード（条件付き更新） |

---

## 完了条件チェックリスト

- [ ] 実装ファイル・テストファイルをレビューした
- [ ] 変更記録テーブルを記載した（変更なしの場合もその旨を明記）
- [ ] リファクタリング後に全テストが PASS している
- [ ] `pnpm --filter @repo/shared typecheck` が通っている
- [ ] リファクタリング後もカバレッジ目標（Line 95%以上・Branch 90%以上）を維持している
- [ ] リファクタリング結果を `outputs/phase-8/refactoring-result.md` に記録した

---

## Phase末端アクション【必須】チェックリスト

- [ ] 成果物ファイルを `outputs/phase-8/` に保存した
- [ ] 変更記録テーブルを完成させた（変更なし・変更ありどちらも明記）
- [ ] リファクタリング後テスト実行ログを `outputs/phase-8/refactoring-result.md` に貼り付けた
- [ ] カバレッジ目標の維持を確認した
- [ ] 次のPhase（Phase 9）の前提条件を満たしていることを確認した
- [ ] Phase 8 のステータスを「完了」に更新した

---

## 依存関係

| 種別 | Phase番号 | Phase名        | 依存内容                                         |
| ---- | --------- | -------------- | ------------------------------------------------ |
| 前提 | Phase 7   | カバレッジ確認 | カバレッジ目標（Line 95%・Branch 90%）の達成済み |
| 後続 | Phase 9   | 品質保証       | リファクタリング済みコード・全テスト PASS 状態   |

---

## 統合テスト連携

- `refactoring-result.md` で固定した pure function 境界を Phase 9 の品質保証へ引き継ぐ
- リファクタリング後の挙動は Phase 10 の最終レビューと Phase 11 の手動テストで再確認する
- 変更箇所が `packages/shared/src/types/` に閉じていることを Phase 12 の system spec 更新に反映する

## 次のPhase

**Phase 9: 品質保証**

Phase 8 でリファクタリングが完了したコードをベースに、受入基準（AC-1〜AC-5）と品質ゲート（test/typecheck/lint）を最終確認する。
