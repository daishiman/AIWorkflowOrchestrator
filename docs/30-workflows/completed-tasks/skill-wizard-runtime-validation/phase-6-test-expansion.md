# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase番号  | 6                                                 |
| Phase名    | テスト拡充                                        |
| 前提Phase  | Phase 5                                           |
| 後続Phase  | Phase 7                                           |
| ステータス | 未実施                                            |
| 作成日     | 2026-04-08                                        |
| 機能名     | skill-wizard-runtime-validation                   |
| Issue      | #1999 (UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001) |

---

## 目的

Phase 5 で Green にした最小実装に対して、エッジケース・fail path・回帰ガードのテストを追加する。

基本テストケース（TC-01〜TC-12）が網羅していない境界値・特殊入力・マルチバイト文字などをカバーすることで、将来の変更に対する回帰安全性を高める。

本Phaseでも `validateSkillInfoForm` を正式名称として扱い、
`validateSkillInfoFormValues` は使用しない。

---

## 実行タスク

### タスク1: エッジケーステスト追加

**目的**: Phase 4 のテストケースでカバーされていないエッジケースを特定し、テストファイルに追加する。

**対象ファイル**: `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts`

**実行手順**:

1. 現在のテストファイルを開き、既存のテストケースを確認する
2. 以下のエッジケースを新しいテストとして追加する
3. テスト実行で全件 PASS を確認する

---

#### 追加するエッジケース一覧

| EC番号 | 対象関数                   | テストシナリオ                                             | 入力                                                                                          | 期待結果                                                             |
| ------ | -------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| EC-01  | `validateSkillName`        | 空文字列 `""` → invalid（空白onlyと同様）                  | `""`                                                                                          | `{ valid: false, error: "スキル名を入力してください" }`              |
| EC-02  | `validateSkillName`        | 前後に空白を含む文字列 → trim後チェック（有効）            | `" テスト "`                                                                                  | `{ valid: true }`                                                    |
| EC-03  | `validateSkillName`        | 前後に空白を含む文字列 → trim後が101文字なら invalid       | `" ${"あ".repeat(101)} "`                                                                     | `{ valid: false, error: "スキル名は100文字以内で入力してください" }` |
| EC-04  | `validatePurpose`          | 空文字列 `""` → invalid（10文字未満）                      | `""`                                                                                          | `{ valid: false, error: "目的は10文字以上で入力してください" }`      |
| EC-05  | `validatePurpose`          | 日本語文字の文字数カウント（マルチバイト）— 10文字ちょうど | `"あいうえおかきくけこ"` (10文字)                                                             | `{ valid: true }`                                                    |
| EC-06  | `validatePurpose`          | 日本語文字の文字数カウント（マルチバイト）— 9文字          | `"あいうえおかきくけ"` (9文字)                                                                | `{ valid: false, error: "目的は10文字以上で入力してください" }`      |
| EC-07  | `validatePurpose`          | 日本語500文字ちょうど → valid                              | `"あ".repeat(500)` (500文字)                                                                  | `{ valid: true }`                                                    |
| EC-08  | `validatePurpose`          | 日本語501文字 → invalid                                    | `"あ".repeat(501)` (501文字)                                                                  | `{ valid: false, error: "目的は500文字以内で入力してください" }`     |
| EC-09  | `validateSkillInfoForm`    | skillName が `undefined`、purpose が valid → isValid: true | `{ purpose: "十文字以上の目的" }`                                                             | `{ isValid: true }`                                                  |
| EC-10  | `validateSkillInfoForm`    | skillName が有効、purpose が空文字列 → isValid: false      | `{ skillName: "スキル", purpose: "" }`                                                        | `{ isValid: false, purpose: "目的は10文字以上で入力してください" }`  |
| EC-11  | `validateSkillInfoForm`    | `category` は入力対象外（`skillName`/`purpose` のみ検証）  | `{ skillName: "x", purpose: "十文字以上" }`                                                   | `{ isValid: true }`                                                  |
| EC-12  | `validateSkillInfoForm`    | public barrel からも利用できる                             | `validateSkillInfoFormFromBarrel({ skillName: "スキル", purpose: "十分な長さの目的文字列" })` | `{ isValid: true }`                                                  |
| EC-13  | `SkillInfoValidationInput` | 型境界（`category` を受け取らない）                        | `expectTypeOf<SkillInfoValidationInput>()`                                                    | `skillName?: string; purpose: string`                                |

---

**エッジケース追加の観点**:

1. **空文字列 `""`**: `undefined`/`null` と空文字列は異なる入力であるが、`validateSkillName` では同様に invalid とすべき。trim後の挙動と合わせて確認する。
2. **前後空白トリム**: `skillName` に前後空白がある場合、trim後の内容でバリデーションされることを確認する。これにより「 　 」（全角スペースのみ）も無効になる。
3. **マルチバイト文字のカウント**: JavaScript の `string.length` はコードユニット数を返すため、日本語1文字 = 1としてカウントされる。この動作を明示的にテストしておく。
4. **`validateSkillInfoForm` の複合ケース**: `skillName` が `undefined` の場合（任意フィールド）と `purpose` が空の場合の組み合わせを検証する。
5. **`category` の扱い**: `SkillInfoFormData` には `category` があるが、本バリデーション関数は `skillName`/`purpose` のみを検証する設計であることを明示する。

---

### タスク2: テスト実行確認（全件PASS）

**目的**: エッジケーステスト追加後も既存テスト・新規テスト全件が PASS することを確認する。

**実行手順**:

1. 以下のコマンドを実行する:
   ```bash
   pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts
   ```
2. TC-01〜TC-12 + EC-01〜EC-13 の全件が PASS していることを確認する
3. 失敗するテストがある場合は実装を修正する（テストは変更しない）
4. 実行結果を `outputs/phase-6/test-expansion-result.md` に記録する

**期待される出力例**:

```
PASS packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts
  validateSkillName
    ✓ undefined → valid
    ✓ null → valid
    ✓ 空白のみ → invalid
    ✓ 通常文字列 → valid
    ✓ 101文字 → invalid
    ✓ 100文字 → valid
    ✓ 空文字列 → invalid (EC-01)
    ✓ 前後空白あり文字列 → trim後 valid (EC-02)
    ✓ 前後空白あり100文字超 → invalid (EC-03)
  validatePurpose
    ✓ 10文字以上 → valid
    ✓ 9文字 → invalid
    ✓ 501文字 → invalid
    ✓ 500文字 → valid
    ✓ 空文字列 → invalid (EC-04)
    ✓ 日本語10文字 → valid (EC-05)
    ✓ 日本語9文字 → invalid (EC-06)
    ✓ 日本語500文字 → valid (EC-07)
    ✓ 日本語501文字 → invalid (EC-08)
  validateSkillInfoForm
    ✓ 全フィールド valid → isValid: true
    ✓ skillName空白 + purpose短い → isValid: false
    ✓ skillName undefined + purpose valid → isValid: true (EC-09)
    ✓ skillName valid + purpose空文字列 → isValid: false (EC-10)
    ✓ categoryは入力対象外（skillName/purposeのみ検証）→ isValid: true (EC-11)
    ✓ public barrel からも利用できる → isValid: true (EC-12)

Test Files  1 passed (1)
Tests       25 passed (25)
```

**期待成果物**: `outputs/phase-6/test-expansion-result.md`

---

## 参照資料

| 資料名                       | パス / URL                                                            | 参照目的                     |
| ---------------------------- | --------------------------------------------------------------------- | ---------------------------- |
| テストファイル               | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | 追加先ファイル               |
| 実装ファイル                 | `packages/shared/src/types/skillInfoFormValidation.ts`                | バリデーションロジック確認   |
| Phase 4 テストマトリクス     | `outputs/phase-4/test-matrix.md`                                      | 既存テストケースとの重複確認 |
| MDN: String.prototype.length | https://developer.mo                                                  |
| Red確認記録                  | `outputs/phase-4/red-confirmation.md`                                 | Phase 4 成果物               |
| 実装結果記録                 | `outputs/phase-5/implementation-result.md`                            | Phase 5 成果物               |
| Green確認記録                | `outputs/phase-5/green-confirmation.md`                               | Phase 5 成果物               |

zilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length | マルチバイト文字カウントの仕様確認 |

---

## 成果物テーブル

| 成果物                 | パス                                                                  | 種別           |
| ---------------------- | --------------------------------------------------------------------- | -------------- |
| テスト拡充結果記録     | `outputs/phase-6/test-expansion-result.md`                            | ドキュメント   |
| テストファイル（更新） | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | コード（更新） |

---

## 完了条件チェックリスト

- [ ] EC-01〜EC-13 の全エッジケーステストがテストファイルに追加されている
- [ ] TC-01〜TC-12 + EC-01〜EC-13 の全 25 件がテスト実行で PASS している
- [ ] 日本語マルチバイト文字の文字数カウントをテストで確認した
- [ ] 空文字列 `""` が `validateSkillName` で invalid になることを確認した
- [ ] `validateSkillInfoForm` の複合ケースが正しく動作することを確認した
- [ ] `category` が本バリデーションの対象外であることを確認した
- [ ] テスト拡充結果を `outputs/phase-6/test-expansion-result.md` に記録した

---

## Phase末端アクション【必須】チェックリスト

- [ ] 成果物ファイルを `outputs/phase-6/` に保存した
- [ ] テスト実行ログを `outputs/phase-6/test-expansion-result.md` に貼り付けた
- [ ] 全テストが Green であることを確認した
- [ ] 次のPhase（Phase 7）の前提条件（全テスト PASS）を満たしていることを確認した
- [ ] Phase 6 のステータスを「完了」に更新した

---

## 依存関係

| 種別 | Phase番号 | Phase名        | 依存内容                                                |
| ---- | --------- | -------------- | ------------------------------------------------------- |
| 前提 | Phase 5   | 実装           | `skillInfoFormValidation.ts` の実装完了・全テスト Green |
| 後続 | Phase 7   | カバレッジ確認 | 拡充後テストの存在（カバレッジ計測対象）                |

---

## 統合テスト連携

- `test-expansion-result.md` の追加ケースは Phase 7 のカバレッジ確認へ直接引き継ぐ
- 追加した境界値は Phase 8 のリファクタリングで回帰保護の基準として使う
- テスト件数の増分は Phase 11 の手動テスト結果に再掲する

## 次のPhase

**Phase 7: カバレッジ確認**

Phase 6 で拡充したテスト群を使い、`skillInfoFormValidation.ts` のカバレッジ（Line 95%以上・Branch 90%以上）を計測・確認する。
