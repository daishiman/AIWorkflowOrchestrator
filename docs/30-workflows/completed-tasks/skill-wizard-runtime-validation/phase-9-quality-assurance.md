# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| Phase名    | 品質保証                        |
| 前提Phase  | Phase 8                         |
| 後続Phase  | Phase 10                        |
| ステータス | 未実施                          |
| 作成日     | 2026-04-08                      |
| 機能名     | skill-wizard-runtime-validation |

---

## 目的

line budget・型チェック・lint・テスト全件PASSを一括確認し、
Phase 10（最終レビューゲート）に進めるだけの品質水準が達成されていることを保証する。

---

## 実行タスク

### タスク1: テスト全件実行確認

**目的**: バリデーション関数のユニットテストが全件PASSすることを確認する

**実行手順**:

```bash
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts
```

**期待成果物**:

- 全テストケースがPASSすること（0件のFAIL）
- AC-1（空白チェック）・AC-2（最小文字数）・AC-3（テストPASS）を満たすこと
- テスト件数・PASS件数を `outputs/phase-9/quality-check-result.md` に記録する

---

### タスク2: TypeScript型チェック

**目的**: 型エラーが存在しないことを確認し、AC-5 を満たすことを検証する

**実行手順**:

```bash
pnpm --filter @repo/shared typecheck
```

**期待成果物**:

- 型エラー 0件
- `packages/shared/src/types/skillInfoFormValidation.ts` の型定義が整合していること
- `packages/shared/src/types/index.ts` の公開エクスポートが整合していること
- 結果を `outputs/phase-9/quality-check-result.md` に追記する

---

### タスク3: Lintチェック

**目的**: コーディング規約に準拠していることを確認する

**実行手順**:

```bash
pnpm --filter @repo/shared lint
```

**期待成果物**:

- ESLintエラー 0件
- ESLint warning が残る場合はその内容を記録し、許容可否を判断する
- 結果を `outputs/phase-9/quality-check-result.md` に追記する

---

### タスク4: 受入基準（AC-1〜AC-5）の達成確認

**目的**: 全受入基準が実装により充足されていることを検証する

**実行手順**:

以下のチェックリストを `outputs/phase-9/quality-check-result.md` に記録する。

| AC番号 | 基準                                                                       | 検証方法          | 結果 |
| ------ | -------------------------------------------------------------------------- | ----------------- | ---- |
| AC-1   | `skillName` が空白のみの場合、バリデーションエラーが返される               | ユニットテスト    |      |
| AC-2   | `purpose` が最小文字数（10文字）未満の場合、バリデーションエラーが返される | ユニットテスト    |      |
| AC-3   | バリデーション関数のユニットテストが実装され PASS する                     | `vitest run` PASS |      |
| AC-4   | バリデーションエラーメッセージが日本語で定義されている                     | コードレビュー    |      |
| AC-5   | `pnpm --filter @repo/shared typecheck` が通る                              | typecheck PASS    |      |

**期待成果物**:

- AC-1〜AC-5 が全て達成済みであること
- 未達の AC がある場合は該当 Phase（設計・実装）へ戻る

---

## 品質チェックリスト

### 機能検証

- [ ] AC-1: `skillName` の空白チェックが正しく機能すること
- [ ] AC-2: `purpose` の最小文字数チェックが正しく機能すること
- [ ] AC-4: エラーメッセージが全て日本語であること
- [ ] `skillName` が `undefined` のとき valid を返すこと（任意フィールド）
- [ ] `skillName` が最大100文字を超えるとき invalid を返すこと
- [ ] `purpose` が最大500文字を超えるとき invalid を返すこと

### コード品質

- [ ] バリデーション関数がピュア関数として実装されていること（副作用なし）
- [ ] `as const` による型の厳密性が確保されていること
- [ ] 命名規則（`validate*` プレフィックス・`SCREAMING_SNAKE_CASE` 定数）が遵守されていること
- [ ] フィールド結果型が `SkillInfoFieldValidationResult`、フォーム結果型が `SkillInfoFormValidationResult` で定義され、`slideSettings.ts` の `ValidationResult` と衝突しないこと
- [ ] 入力境界が `SkillInfoValidationInput` で明示され、`category` を含めていないこと
- [ ] `SKILL_INFO_VALIDATION_LIMITS` に文字数制限が集約され、magic number が残っていないこと
- [ ] ESLintエラーが 0件であること
- [ ] TypeScriptエラーが 0件であること（AC-5）

### テスト網羅性

- [ ] 正常系テスト（valid な入力）が存在すること
- [ ] 異常系テスト（空白・最小文字数未満等）が存在すること
- [ ] 境界値テスト（ちょうど10文字・11文字 等）が存在すること
- [ ] `undefined` / `null` など型境界のテストが存在すること
- [ ] 全テストケースがPASS（0件のFAIL）であること

---

## 参照資料

| 資料名                     | パス                                                                  | 説明                |
| -------------------------- | --------------------------------------------------------------------- | ------------------- |
| バリデーション実装ファイル | `packages/shared/src/types/skillInfoFormValidation.ts`                | レビュー対象        |
| テストファイル             | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | ユニットテスト      |
| 受入基準                   | `outputs/phase-1/acceptance-criteria.md`                              | AC-1〜AC-5 の定義元 |
| Phase 8 実装成果物         | `outputs/phase-8/`                                                    | 実装完了時の記録    |
| 実装結果記録               | `outputs/phase-5/implementation-result.md`                            | Phase 5 成果物      |
| Green確認記録              | `outputs/phase-5/green-confirmation.md`                               | Phase 5 成果物      |
| リファクタリング結果       | `outputs/phase-8/refactoring-result.md`                               | Phase 8 成果物      |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | Markdown |

---

## 統合テスト連携

- `quality-check-result.md` の PASS/FAIL 判定は Phase 10 の最終レビュー入力として利用する
- 品質保証で未検出だった差分は Phase 11 の手動テスト結果と突き合わせる
- ここで固定した current facts は Phase 12 のドキュメント更新で再利用する

## 完了条件

- [ ] `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts` が全件PASSすること
- [ ] `pnpm --filter @repo/shared typecheck` が 0エラーで完了すること
- [ ] `pnpm --filter @repo/shared lint` が 0エラーで完了すること
- [ ] AC-1〜AC-5 が全て達成済みであることが確認されていること
- [ ] 品質チェックリスト（機能検証・コード品質・テスト網羅性）が全項目チェック済みであること
- [ ] `outputs/phase-9/quality-check-result.md` が生成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクの実行結果を `outputs/phase-9/quality-check-result.md` に記録
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（実装）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-wizard-runtime-validation/phase-10-final-review.md`
