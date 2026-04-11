# Phase 12: 実装ガイド - UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001

## メタ情報

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- | --- | --- | --- | --- | ---------- |
| タスクID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001        |
| 作成日   | 2026-04-11                                           |
| 対象     | `SkillCategory` の日本語ラベルマッピング共有契約     |
| 状態     | completed（Phase 12 canonical 6 を更新済み）         |
|          |                                                      |     |     |     |     | Stash base |
| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| タスクID | TASK-SC-07                                           |
| 作成日   | 2026-04-09                                           |
| 対象     | `SkillCreateWizard` の LLM / template 併用フロー     |
| 状態     | completed（Phase 1-12 completed / Phase 13 blocked） |

---

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスクID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001    |
| 作成日   | 2026-04-11                                       |
| 対象     | `SkillCategory` の日本語ラベルマッピング共有契約 |
| 状態     | completed（Phase 12 canonical 6 を更新済み）     |

---

## Part 1: 中学生向け説明

### 何を直したのか

スキルのカテゴリ名は、もともと `automation` や `code-support` のような英語の札でした。  
今回は、その札を日本語の札に変える仕組みを 1 か所にまとめました。

たとえば、引き出しに英語の番号だけが書いてあると、使う人は中身をすぐに思い出しにくいです。  
そこで、番号の横に「自動化」「外部連携」などの日本語の名前を貼るイメージです。

### なぜ必要か

- 人が見たときに意味がわかりやすいからです
- 画面ごとに違う名前を書かなくてよくなるからです
- 1つの名前を直せば、関係する画面にまとめて反映できるからです

### 何をするか

- `SkillCategory` の 5 つの値に日本語ラベルを付ける
- そのラベルを `skillCreator.ts` に集める
- 画面では、そのラベルをそのまま使う

---

## Part 2: 開発者向け説明

### 変更点サマリー

| ファイル                                                                                         | 変更内容                                                                                                                                        |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | --- | --- | ---------- |
| `packages/shared/src/types/skillCreator.ts`                                                      | `SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel()` を公開し、`satisfies` で型網羅性を固定                                                     |
| `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`                                | `SkillCategory` の union 劣化を検出する型テストを追加                                                                                           |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                            | カテゴリ表示を shared helper から生成するように変更                                                                                             |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                             | deprecated step でも shared helper を参照し、`コード支援` の drift を解消                                                                       |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`              | canonical label が option として描画されることを追加検証                                                                                        |
| `docs/30-workflows/ut-skill-wizard-w0-category-label-mapping-001/*`                              | 参照リンク、AC、品質確認、Phase 12 台帳を current facts に同期                                                                                  |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`      | Skill Wizard Shared Contracts へラベル共有契約を追記                                                                                            |
|                                                                                                  |                                                                                                                                                 |     |     |     |     | Stash base |
| ファイル                                                                                         | 変更内容                                                                                                                                        |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | LLM / template のモード分岐、`planSkill` / `executePlan` / `getWorkflowState` 連携、`skillSpec` の正本使用、request-id ガード、対称クリアを実装 |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                             | `generationProgress`、`planResult`、`terminal_handoff` guidance、実行ボタン/キャンセルボタンの表示条件を整理                                    |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                             | `GenerationMode` の import 元を barrel に合わせて整理。現行 Step 0 の正本は `SkillInfoStep`                                                     |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`              | `generationProgress`、`terminal_handoff`、`最初からやり直す`、`実行する` 非表示の回帰を追加                                                     |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | `skillSpec` 必須化、blank input、`getWorkflowState` failure snapshot、terminal handoff、mode switch を検証                                      |

---

| ファイル                                                                                    | 変更内容                                                                                    |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                                 | `SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel()` を公開し、`satisfies` で型網羅性を固定 |
| `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`                           | `SkillCategory` の union 劣化を検出する型テストを追加                                       |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                       | カテゴリ表示を shared helper から生成するように変更                                         |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                        | deprecated step でも shared helper を参照し、`コード支援` の drift を解消                   |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`         | canonical label が option として描画されることを追加検証                                    |
| `docs/30-workflows/ut-skill-wizard-w0-category-label-mapping-001/*`                         | 参照リンク、AC、品質確認、Phase 12 台帳を current facts に同期                              |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | Skill Wizard Shared Contracts へラベル共有契約を追記                                        |

### current contract

```ts
export type SkillCategory =
  | "automation"
  | "external-integration"
  | "data-analysis"
  | "code-support"
  | "other";

export const SKILL_CATEGORY_LABELS = {
  automation: "自動化",
  "external-integration": "外部連携",
  "data-analysis": "データ分析",
  "code-support": "コードサポート",
  other: "その他",
} as const satisfies Record<SkillCategory, string>;

export function getSkillCategoryLabel(category: SkillCategory): string {
  return SKILL_CATEGORY_LABELS[category];
}
```

### target delta

- 共有型の正本を 1 か所に置く
- UI はその正本を読む
- 新しいカテゴリ追加時は TypeScript がラベル漏れを止める

### 使用例

```ts
import {
  getSkillCategoryLabel,
  type SkillCategory,
} from "@repo/shared/types/skillCreator";

const category: SkillCategory = "external-integration";
const label = getSkillCategoryLabel(category); // "外部連携"
```

### エラーとエッジケース

- 新しい `SkillCategory` を増やしてラベルを追加し忘れると、`satisfies Record<SkillCategory, string>` がコンパイルで止める
- `DescribeStep` のような旧画面が別表記を持っても、shared helper 参照に寄せたので drift を防げる
- `@repo/shared` root barrel には広げず、`@repo/shared/types/skillCreator` の subpath で閉じる

### 設定可能なパラメータと定数

| 名前                    | 種別        | 役割                                          |
| ----------------------- | ----------- | --------------------------------------------- |
| `SkillCategory`         | type        | 5 つのカテゴリ値を固定する                    |
| `SKILL_CATEGORY_LABELS` | const       | UI 表示用の日本語ラベル正本                   |
| `getSkillCategoryLabel` | function    | 表示名を 1 つ返す共通 API                     |
| `CATEGORY_VALUES`       | local const | `SkillInfoStep` / `DescribeStep` の表示順制御 |

### 検証メモ

- TypeScript 型チェックは PASS
- ESLint は PASS
- `vitest` はこの環境で esbuild バイナリ不整合により起動失敗したため、追加確認は別 wave が必要
- 新規スクリーンショットは未作成。今回はラベル共有と drift 解消が主で、レイアウト変更ではない

### まとめ

この更新で、カテゴリ名は shared の 1 つの正本に集まりました。  
画面側はその正本を読むだけになり、表示名のズレを減らせます。
||||||| Stash base

- `DescribeStep.tsx` は現行の正本ではなく、互換性のために残る deprecated ファイル。
- `skillSpec` は `executePlan` の必須引数で、description の代用にしない。
- `clearGenerationState()` はローカル state だけでなく、共有 store も初期化する。
- `resetStreamingProgress()` で cancelled ステージを次回生成に持ち越さない。

---

### 設定可能なパラメータと定数

| 名前                    | 種別        | 役割                                          |
| ----------------------- | ----------- | --------------------------------------------- |
| `SkillCategory`         | type        | 5 つのカテゴリ値を固定する                    |
| `SKILL_CATEGORY_LABELS` | const       | UI 表示用の日本語ラベル正本                   |
| `getSkillCategoryLabel` | function    | 表示名を 1 つ返す共通 API                     |
| `CATEGORY_VALUES`       | local const | `SkillInfoStep` / `DescribeStep` の表示順制御 |

### 検証メモ

- TypeScript 型チェックは PASS
- ESLint は PASS
- `vitest` はこの環境で esbuild バイナリ不整合により起動失敗したため、追加確認は別 wave が必要
- 新規スクリーンショットは未作成。今回はラベル共有と drift 解消が主で、レイアウト変更ではない

### まとめ

この更新で、カテゴリ名は shared の 1 つの正本に集まりました。  
画面側はその正本を読むだけになり、表示名のズレを減らせます。
