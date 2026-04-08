# Phase 2: 設計

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| 前提Phase  | Phase 1                         |
| 後続Phase  | Phase 3                         |
| ステータス | 未実施                          |
| 作成日     | 2026-04-08                      |
| 機能名     | skill-wizard-runtime-validation |

---

## 目的

バリデーション関数のインターフェース・エラーメッセージ定数・ファイル配置を設計し、
Phase 3 レビューゲートを通過できる設計書を作成する。

## 背景

Phase 1 で確定した受入基準（AC-1〜AC-5）を実現するための設計を決定する。
`SkillInfoFormData` 型（`packages/shared/src/types/skillCreator.ts`）を変更せず、
独立したバリデーション関数として実装する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ファイル配置設計

**目的**: バリデーション関数の配置先を決定する

**実行手順**:

1. `packages/shared/src/agent/validation.ts` のパターンを確認する
2. `packages/shared/src/types/` 配下の既存ファイル構成を確認する
3. 新規ファイル `packages/shared/src/types/skillInfoFormValidation.ts` の配置を決定する
4. 公開エクスポートを `packages/shared/src/types/index.ts` に集約するか判断する

**決定事項**:

| 配置先                                                                | 理由                                                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `packages/shared/src/types/skillInfoFormValidation.ts`                | 型定義（`skillCreator.ts`）と同階層。関連性が明確                                                      |
| `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | 既存 `__tests__/` 配下に配置。命名規則と一致                                                           |
| `packages/shared/src/types/index.ts`                                  | 新規バリデーションAPIの公開出口。root `packages/shared/index.ts` は `./types` 再エクスポート経由で追随 |

---

### タスク2: インターフェース設計

**目的**: バリデーション関数の型定義を設計する

**実行手順**:

1. バリデーション結果の型を定義する
2. `skillName` バリデーション関数のシグネチャを設計する
3. `purpose` バリデーション関数のシグネチャを設計する
4. 個別フィールド検証とフォーム全体検証のインターフェースを設計する

**設計案**:

```typescript
import type { SkillInfoFormData } from "./skillCreator";

// フィールド単位のバリデーション結果型
// NOTE: 既存の slideSettings.ts に ValidationResult が存在するため名称を分離する
export interface SkillInfoFieldValidationResult {
  valid: boolean;
  error?: string;
}

// 入力境界（category は本タスクの検証対象外）
export type SkillInfoValidationInput = Pick<
  SkillInfoFormData,
  "skillName" | "purpose"
>;

// フォーム単位の戻り値
export interface SkillInfoFormValidationResult {
  skillName?: string;
  purpose?: string;
  isValid: boolean;
}

// skillName バリデーション
// - undefined / null は valid（任意フィールドのため）
// - 空白のみは invalid
// - 最大100文字超過は invalid
export function validateSkillName(
  skillName: string | undefined | null,
): SkillInfoFieldValidationResult;

// purpose バリデーション
// - 10文字未満は invalid
// - 500文字超過は invalid
export function validatePurpose(
  purpose: string,
): SkillInfoFieldValidationResult;

// フォーム全体バリデーション
export function validateSkillInfoForm(
  values: SkillInfoValidationInput,
): SkillInfoFormValidationResult;
```

---

### タスク3: エラーメッセージ定数設計

**目的**: 日本語エラーメッセージを定数として定義する

**設計案**:

```typescript
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

export const SKILL_INFO_VALIDATION_LIMITS = {
  skillName: {
    maxLength: 100,
  },
  purpose: {
    minLength: 10,
    maxLength: 500,
  },
} as const;
```

---

### タスク4: 既存コードの命名規則分析

**目的**: Phase 1 フィードバック [FB-SDK-07-4] 対応。既存命名パターンと整合性を確認する

**実行手順**:

```bash
# packages/shared 内のバリデーション関数命名パターン確認
grep -n "^export function\|^export const" packages/shared/src/agent/validation.ts

# Result 型の命名パターン確認
grep -n "Result\|Error\|Validation" packages/shared/src/agent/validation.ts | head -20
```

**確認ポイント**:

- `SkillInfoFieldValidationResult` を採用し、既存 `ValidationResult` との名称衝突を回避
- `validate*` vs `check*` — 既存パターンに合わせる
- エラーメッセージの形式（文字列 vs オブジェクト）

---

## 参照資料

| 参照資料             | パス                                        | 内容                       |
| -------------------- | ------------------------------------------- | -------------------------- |
| SkillInfoFormData 型 | `packages/shared/src/types/skillCreator.ts` | バリデーション対象の型定義 |
| 既存バリデーション   | `packages/shared/src/agent/validation.ts`   | 命名規則・パターン参考     |
| Phase 1 成果物       | `outputs/phase-1/acceptance-criteria.md`    | AC-1〜AC-5 の詳細          |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`       | Phase 1 成果物             |
| スコープ定義書       | `outputs/phase-1/scope-definition.md`       | Phase 1 成果物             |

---

## 成果物

| 成果物                | パス                                      | 内容                       |
| --------------------- | ----------------------------------------- | -------------------------- |
| 設計決定書            | `outputs/phase-2/design-decisions.md`     | ファイル配置・設計判断記録 |
| バリデーションI/F設計 | `outputs/phase-2/validation-interface.md` | 型定義・関数シグネチャ     |
| エラーメッセージ設計  | `outputs/phase-2/error-messages.md`       | 日本語メッセージ定数一覧   |

---

## 統合テスト連携

- バリデーション関数はピュア関数のため統合テスト不要
- Phase 4 TDD Red で全 AC のテストケースを先行作成する
- 命名規則の整合性を Phase 3 レビューゲートで確認する

---

## 完了条件

- [ ] ファイル配置が決定し `outputs/phase-2/design-decisions.md` に記録されていること
- [ ] `SkillInfoFieldValidationResult` / `SkillInfoFormValidationResult` と3つのバリデーション関数のシグネチャが確定していること
- [ ] `SkillInfoValidationInput = Pick<SkillInfoFormData, "skillName" | "purpose">` が定義されていること
- [ ] 日本語エラーメッセージ定数が `outputs/phase-2/error-messages.md` に記録されていること
- [ ] 文字数制限の定数値（100文字 / 10文字 / 500文字）が確定していること
- [ ] 既存命名規則との整合性が確認されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-wizard-runtime-validation/phase-3-design-review.md`
