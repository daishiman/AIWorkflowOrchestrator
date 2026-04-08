# Phase 5: 実装（TDD Green フェーズ）

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase番号  | 5                                                 |
| Phase名    | 実装                                              |
| 前提Phase  | Phase 4                                           |
| 後続Phase  | Phase 6                                           |
| ステータス | 未実施                                            |
| 作成日     | 2026-04-08                                        |
| 機能名     | skill-wizard-runtime-validation                   |
| Issue      | #1999 (UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001) |

---

## 目的

TDD Green フェーズ。Phase 4 で作成したテストを Green にする最小実装を行う。

過剰実装を避け、テストが要求する仕様のみを満たす実装にとどめる。実装後は全テストが PASS（Green）であることを確認する。

---

## 実行タスク

### タスク1: 実装計画（P50チェック含む）

**目的**: 新規作成ファイルの一覧を確認し、既存ファイルとの衝突がないことを確認する。

**実行手順**:

1. 以下のコマンドで対象ファイルが存在しないことを確認する（P50チェック）:

   ```bash
   ls packages/shared/src/types/skillInfoFormValidation.ts
   ```

   - ファイルが存在しない → 実装へ進む
   - ファイルが存在する → 内容を確認し、上書き対象か判断してから進む

2. 実装計画テーブルを確認する

**P50チェック**: 実装前に `packages/shared/src/types/skillInfoFormValidation.ts` が存在しないことを確認すること。

---

#### 実装計画テーブル

| 種別     | ファイルパス                                           | 内容                             |
| -------- | ------------------------------------------------------ | -------------------------------- |
| 新規作成 | `packages/shared/src/types/skillInfoFormValidation.ts` | バリデーション関数・型定義・定数 |
| 更新     | `packages/shared/src/types/index.ts`                   | 公開エクスポートの追加           |

**変更対象**: UIコンポーネント・既存型定義ファイルは変更しない一方、公開エクスポートは `packages/shared/src/types/index.ts` で更新する

---

### タスク2: `skillInfoFormValidation.ts` 実装

**目的**: 設計済みインターフェースに従い、バリデーション関数を実装する。

**対象ファイル**: `packages/shared/src/types/skillInfoFormValidation.ts`（新規作成）

**実行手順**:

1. 設計済みインターフェースを参照し、以下の順序で実装する:
   - `SkillInfoFieldValidationResult` インターフェース
   - `SkillInfoValidationInput` 型
   - `SkillInfoFormValidationResult` インターフェース
   - `SKILL_INFO_VALIDATION_LIMITS` 定数
   - `SKILL_INFO_VALIDATION_MESSAGES` 定数
   - `validateSkillName` 関数
   - `validatePurpose` 関数
   - `validateSkillInfoForm` 関数
   - `packages/shared/src/types/index.ts` への再エクスポート追加
2. 型定義は `any` を使用しない（AC-5: typecheck通過のため）
3. エラーメッセージは `SKILL_INFO_VALIDATION_MESSAGES` 定数から参照する

**設計済みインターフェース（実装の拠り所）**:

```typescript
import type { SkillInfoFormData } from "./skillCreator";

export interface SkillInfoFieldValidationResult {
  valid: boolean;
  error?: string;
}

export type SkillInfoValidationInput = Pick<
  SkillInfoFormData,
  "skillName" | "purpose"
>;

export interface SkillInfoFormValidationResult {
  skillName?: string;
  purpose?: string;
  isValid: boolean;
}

export const SKILL_INFO_VALIDATION_LIMITS = {
  skillName: {
    maxLength: 100,
  },
  purpose: {
    minLength: 10,
    maxLength: 500,
  },
} as const;

export const SKILL_INFO_VALIDATION_MESSAGES = {
  skillName: {
    required: "スキル名を入力してください",
    maxLength: "スキル名は100文字以内で入力してください",
  },
  purpose: {
    minLength: "目的は10文字以上で入力してください",
    maxLength: "目的は500文字以内で入力してください",
  },
} as const;

export function validateSkillName(
  skillName: string | undefined | null,
): SkillInfoFieldValidationResult;

export function validatePurpose(
  purpose: string,
): SkillInfoFieldValidationResult;

export function validateSkillInfoForm(
  values: SkillInfoValidationInput,
): SkillInfoFormValidationResult;
```

**実装上の注意点**:

| 関数                    | バリデーションルール                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `validateSkillName`     | `undefined`/`null` は valid。文字列の場合は trim後に空文字チェック → invalid。trim後100文字超 → invalid               |
| `validatePurpose`       | 10文字未満 → invalid。500文字超 → invalid                                                                             |
| `validateSkillInfoForm` | 各フィールドを個別にバリデーション。全て valid なら `isValid: true`。エラーがあるフィールドのみエラーメッセージを返す |

**期待成果物**: `packages/shared/src/types/skillInfoFormValidation.ts`

---

### タスク3: Green確認

**目的**: 実装後にテストを実行し、全件 PASS（Green）であることを確認する。

**実行手順**:

1. 以下のコマンドを実行する:
   ```bash
   pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts
   ```
2. 全テストケース（TC-01〜TC-12）が PASS していることを確認する
3. TypeScript 型チェックを実行する:
   ```bash
   pnpm --filter @repo/shared typecheck
   ```
4. 実行結果を `outputs/phase-5/green-confirmation.md` に記録する
5. 実装内容のサマリーを `outputs/phase-5/implementation-result.md` に記録する

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
  validatePurpose
    ✓ 10文字以上 → valid
    ✓ 9文字 → invalid
    ✓ 501文字 → invalid
    ✓ 500文字 → valid
  validateSkillInfoForm
    ✓ 全フィールド valid → isValid: true
    ✓ skillName空白 + purpose短い → isValid: false

Test Files  1 passed (1)
Tests       12 passed (12)
```

**期待成果物**:

- `outputs/phase-5/implementation-result.md`
- `outputs/phase-5/green-confirmation.md`

---

## 参照資料

| 資料名                      | パス / URL                                                            | 参照目的                   |
| --------------------------- | --------------------------------------------------------------------- | -------------------------- |
| 設計済みインターフェース    | Issue #1999 本文                                                      | 関数シグネチャ・型定義確認 |
| テストファイル              | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | Green化対象のテスト        |
| 受入基準                    | Issue #1999 AC-1〜AC-5                                                | 実装要件確認               |
| TypeScript 公式ドキュメント | https://www.typescriptlang.org/docs/                                  | 型定義方法                 |
| テストマトリクス            | `outputs/phase-4/test-matrix.md`                                      | Phase 4 成果物             |
| Red確認記録                 | `outputs/phase-4/red-confirmation.md`                                 | Phase 4 成果物             |

---

## 成果物テーブル

| 成果物                     | パス                                                   | 種別           |
| -------------------------- | ------------------------------------------------------ | -------------- |
| バリデーション実装ファイル | `packages/shared/src/types/skillInfoFormValidation.ts` | コード（新規） |
| 公開エクスポート更新       | `packages/shared/src/types/index.ts`                   | コード（更新） |
| 実装結果記録               | `outputs/phase-5/implementation-result.md`             | ドキュメント   |
| Green確認記録              | `outputs/phase-5/green-confirmation.md`                | ドキュメント   |

---

## 完了条件チェックリスト

- [ ] `packages/shared/src/types/skillInfoFormValidation.ts` が新規作成されている
- [ ] `packages/shared/src/types/index.ts` に公開エクスポートが追加されている
- [ ] `SkillInfoFieldValidationResult` インターフェースが export されている
- [ ] `SkillInfoValidationInput` 型が export されている
- [ ] `SkillInfoFormValidationResult` インターフェースが export されている
- [ ] `SKILL_INFO_VALIDATION_LIMITS` 定数が export されている
- [ ] `SKILL_INFO_VALIDATION_MESSAGES` 定数が export されている（日本語メッセージ含む）
- [ ] `validateSkillName` 関数が export されている
- [ ] `validatePurpose` 関数が export されている
- [ ] `validateSkillInfoForm` 関数が export されている
- [ ] テスト実行コマンドで全 12 件が PASS している
- [ ] `pnpm --filter @repo/shared typecheck` が通っている（AC-5）
- [ ] `any` 型を使用していない

---

## Phase末端アクション【必須】チェックリスト

- [ ] 成果物ファイルを `outputs/phase-5/` に保存した
- [ ] Green確認結果（テスト出力ログ）を `outputs/phase-5/green-confirmation.md` に貼り付けた
- [ ] TypeScript 型チェックの結果を記録した
- [ ] 次のPhase（Phase 6）の前提条件（全テスト PASS）を満たしていることを確認した
- [ ] Phase 5 のステータスを「完了」に更新した

---

## 依存関係

| 種別 | Phase番号 | Phase名    | 依存内容                                         |
| ---- | --------- | ---------- | ------------------------------------------------ |
| 前提 | Phase 4   | テスト作成 | テストファイルの存在（Red状態の確認済み）        |
| 後続 | Phase 6   | テスト拡充 | 実装ファイルの存在（エッジケーステスト追加対象） |

---

## 統合テスト連携

- `implementation-result.md` と `green-confirmation.md` の結果は Phase 6 のテスト拡充へ引き継ぐ
- 実装時に見つかった境界値は Phase 7 のカバレッジ確認で分岐網羅を固定する
- 変更対象が pure function のみである点は Phase 11 の NON_VISUAL 判定の根拠として保持する

## 次のPhase

**Phase 6: テスト拡充**

Phase 5 で実装した Green 状態を維持しながら、エッジケース・fail path・回帰ガードのテストを追加する。
