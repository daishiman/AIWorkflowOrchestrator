# Phase 5: 公開 API 前後差分 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## 概要

本タスクで `@repo/shared` の公開 API に新規追加された内容を記録する。
既存の公開 API への破壊的変更はない。

## 差分サマリー

| 種別     | 対象                  | 変更内容          |
| -------- | --------------------- | ----------------- |
| 追加     | `inferSmartDefaults`  | 新規 named export |
| 変更なし | その他すべての export | 影響なし          |

## 追加された公開 API

### inferSmartDefaults

```typescript
/**
 * ユーザー入力（SkillInfoFormData）からスマートデフォルト推論結果を生成する
 *
 * `purpose` は tool/timing の推論対象、`category` は format の独立推論対象。
 * 推論できなかったフィールドは null を返す（フォールバック）。
 * 推論件数が0件でも inferenceLog は空配列 [] として返す。
 *
 * @param input スキル情報入力フォームの値
 * @returns SmartDefaultResult 推論結果
 */
export function inferSmartDefaults(
  input: SkillInfoFormData,
): SmartDefaultResult;
```

### 依存型（既存定義・変更なし）

```typescript
// packages/shared/src/types/skillCreator.ts より（変更なし）

export interface SkillInfoFormData {
  skillName?: string;
  purpose: string;
  category: SkillCategory | null;
}

export interface SmartDefaultResult {
  who: string | null;
  input: string | null;
  timing: string | null;
  output: string | null;
  tool: string | null;
  format: string | null;
  inferenceLog?: string[];
}
```

## インポート方法

```typescript
// 利用側コード例
import { inferSmartDefaults } from "@repo/shared";
import type { SkillInfoFormData, SmartDefaultResult } from "@repo/shared";
```

## 破壊的変更

なし。既存の全 export は変更・削除されていない。
