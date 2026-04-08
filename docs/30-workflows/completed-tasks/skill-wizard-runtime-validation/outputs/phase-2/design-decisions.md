# 設計決定書

## タスク: UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001

## ファイル配置決定

| 配置先                                                                | 変更種別 | 理由                                              |
| --------------------------------------------------------------------- | -------- | ------------------------------------------------- |
| `packages/shared/src/types/skillInfoFormValidation.ts`                | 新規作成 | 型定義（`skillCreator.ts`）と同階層。関連性が明確 |
| `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | 新規作成 | 既存 `__tests__/` 配下に配置。命名規則と一致      |
| `packages/shared/src/types/index.ts`                                  | 更新     | 新規バリデーションAPIの公開出口                   |

root `packages/shared/index.ts` は既存の `export * from "./types"` に追随するため直接変更不要。

## 命名規則の分析結果

`packages/shared/src/agent/validation.ts` の確認結果:

- Zodスキーマベースのバリデーション（`z.object().strict()`）
- `export const xxxSchema = z.object(...)` パターン
- `export type XxxInput = z.input<typeof xxxSchema>` パターン

本タスクはUIフォームバリデーション用の軽量関数実装であるため、Zodは不使用とし、
純粋なTypeScript関数として実装する（依存関係の最小化、テスト容易性向上）。

既存の `ValidationResult` 型（`slideSettings.ts` 等）との名称衝突を回避するため、
専用名 `SkillInfoFieldValidationResult` を採用する。

## 設計判断

| 判断事項               | 決定内容                              | 理由                                                  |
| ---------------------- | ------------------------------------- | ----------------------------------------------------- |
| バリデーション実装方式 | 純粋TypeScript関数（Zodなし）         | UIフォーム用途のシンプルなバリデーション。依存最小化  |
| 型名                   | `SkillInfoFieldValidationResult`      | 既存 `ValidationResult` との衝突回避                  |
| エラーメッセージ       | `SKILL_INFO_VALIDATION_MESSAGES` 定数 | 一元管理・テスト参照・変更容易性                      |
| 文字数制限             | `SKILL_INFO_VALIDATION_LIMITS` 定数   | magic number 排除                                     |
| trim処理               | 各バリデーション関数内で実施          | 入力の前後空白を透過的に処理                          |
| `category` の扱い      | バリデーション対象外                  | 本タスクスコープ外。`SkillInfoValidationInput` で除外 |
