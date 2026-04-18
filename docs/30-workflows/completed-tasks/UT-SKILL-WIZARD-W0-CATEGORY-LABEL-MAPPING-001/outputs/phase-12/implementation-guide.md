# Phase 12: 実装ガイド

## メタ情報

| 項目           | 値                                                   |
| -------------- | ---------------------------------------------------- |
| ドキュメントID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001-PH12-1 |
| タスクID       | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001        |
| フェーズ       | Phase 12 - ドキュメント整備                          |
| ステータス     | PASS                                                 |
| 作成日         | 2026-04-18                                           |

---

## Part 1: 中学生向けの説明

### なぜ必要か

画面に英語のままの分類名を出すと、使う人は意味を毎回読み替えないといけない。たとえば、学校の棚に「A-01」「B-02」とだけ書いてあって、中に何が入っているか日本語で書かれていない状態に近い。番号だけ合っていても、使う人には分かりにくい。

そこで、このタスクでは「分類の中身はそのままにして、見せる名前だけを日本語でそろえる共通表」を使う。そうすると、どの画面でも同じ意味の分類が同じ日本語で表示され、あとから分類が増えても直す場所を 1 か所に集約できる。

### この機能でできること

| 何をそろえるか | 説明                                       | 例                                          |
| -------------- | ------------------------------------------ | ------------------------------------------- |
| 共通の名前表   | 分類ごとの見せ方を 1 か所で決める          | `automation` → `自動化`                     |
| 変換用の入口   | 分類名を渡すと表示名を返す                 | `getSkillCategoryLabel("other")` → `その他` |
| 使い方のルール | 画面側は自分で日本語を持たず、共通表を見る | 同じ分類が別画面でも同じ表示になる          |

### 今回作ったもの

この workflow は docs-only / NON_VISUAL の close-out であり、Phase 12 では新しい仕様差分を作ったのではなく、すでに存在する current facts を現物に合わせて文書へ固定した。

| 項目           | 内容                                                     |
| -------------- | -------------------------------------------------------- |
| 共通の名前表   | `SKILL_CATEGORY_LABELS`                                  |
| 変換用の入口   | `getSkillCategoryLabel`                                  |
| 実装の置き場所 | `packages/shared/src/types/skillCreator.ts`              |
| 公開経路       | `packages/shared/package.json` の `./types/skillCreator` |

---

## Part 2: 開発者向け詳細

### current contract

| 項目         | current facts                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| 型定義       | `SkillCategory` は `"automation" \| "external-integration" \| "data-analysis" \| "code-support" \| "other"` |
| 定数         | `SKILL_CATEGORY_LABELS` は `Record<SkillCategory, string>` を `as const satisfies` で満たす                 |
| 関数         | `getSkillCategoryLabel(category: SkillCategory): string`                                                    |
| 実装ファイル | `packages/shared/src/types/skillCreator.ts`                                                                 |
| テスト       | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`                                           |
| 公開経路     | `packages/shared/package.json` の `./types/skillCreator`                                                    |
| build entry  | `packages/shared/tsup.config.ts` の `src/types/skillCreator.ts`                                             |

### target delta

| 観点          | Before                                       | After                  |
| ------------- | -------------------------------------------- | ---------------------- |
| 実装          | current implementation が存在                | same / no-op           |
| 公開契約      | `@repo/shared/types/skillCreator` が利用可能 | same / no-op           |
| Phase 12 証跡 | 根拠が粗く、一部に誤参照があった             | 現物参照に合わせて修正 |

### 型定義

```typescript
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
```

### APIシグネチャ

```typescript
export function getSkillCategoryLabel(category: SkillCategory): string {
  return SKILL_CATEGORY_LABELS[category];
}
```

### 使用例

```typescript
import { getSkillCategoryLabel } from "@repo/shared/types/skillCreator";

const label = getSkillCategoryLabel("code-support");
// => "コードサポート"
```

### Consumer 側の current usage

今回のレビュー改善で、`apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` のカテゴリボタン表示も `getSkillCategoryLabel()` を参照する形に寄せた。これにより、shared 側の canonical map と consumer 側の表示ラベルが二重管理にならない。

### エラーハンドリング

この API 自体は pure function で、`SkillCategory` を受け取る限り例外を投げない。防御は次の 2 層で行う。

| 層       | 防御内容                                                         |
| -------- | ---------------------------------------------------------------- |
| 型レベル | `SkillCategory` 以外を受け取れない                               |
| 定数定義 | `satisfies Record<SkillCategory, string>` で全値の網羅を強制する |

### エッジケース

| ケース                                | 期待動作                       | 根拠                                      |
| ------------------------------------- | ------------------------------ | ----------------------------------------- |
| 新しい `SkillCategory` 値が追加される | ラベル未定義なら型エラーになる | `satisfies Record<SkillCategory, string>` |
| ラベルが空文字になる                  | テストで検出する               | TC-10                                     |
| `undefined` ラベルが混入する          | テストで検出する               | TC-11                                     |
| キー集合が union とずれる             | テストで検出する               | TC-12                                     |
| 関数と定数の値がずれる                | テストで検出する               | TC-13                                     |

### 設定項目と定数一覧

| 名称                    | 種別 | 内容                         |
| ----------------------- | ---- | ---------------------------- |
| `SKILL_CATEGORY_LABELS` | 定数 | 表示ラベルの正準マップ       |
| `SkillCategory`         | 型   | 許可されるカテゴリ値の union |
| `getSkillCategoryLabel` | 関数 | category からラベルを返す    |

### テスト構成

| 対象                                                                  | 内容                                            |
| --------------------------------------------------------------------- | ----------------------------------------------- |
| `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`     | TC-01〜TC-13 で定数値、キー集合、関数整合を確認 |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` | shared helper を使う consumer 側へ統一          |

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショットは不要。代替証跡として、以下の NON_VISUAL 文書を参照する。

| ファイル                                    | 役割                                     |
| ------------------------------------------- | ---------------------------------------- |
| `outputs/phase-11/test-report.md`           | TC-01〜TC-13 の実測結果                  |
| `outputs/phase-11/manual-test-checklist.md` | NON_VISUAL 判定と確認観点                |
| `outputs/phase-11/manual-test-result.md`    | スクリーンショット非作成の理由と代替証跡 |
| `outputs/phase-11/discovered-issues.md`     | 発見課題 0 件の確認                      |

また、`docs/30-workflows/UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001/` 配下には `screenshots/` と `.gitkeep` を作成していない。これは欠落ではなく、この workflow が docs-only / NON_VISUAL であることに合わせた intentional no-op である。

---

## 検証コマンド

```bash
pnpm --filter @repo/shared test -- skillCreator-wizard.test.ts
pnpm --filter @repo/shared typecheck
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 \
  --json
```

---

## 成果物

| 成果物                                                                                       | 状態     |
| -------------------------------------------------------------------------------------------- | -------- |
| `packages/shared/src/types/skillCreator.ts` の current contract 記録                         | 完了     |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` の consumer drift 解消 | 完了     |
| 本実装ガイド                                                                                 | 更新済み |

---

## 完了条件チェックリスト

- [x] Part 1 で「なぜ必要か」を先に説明した
- [x] Part 1 に `たとえば` を含む日常の例えを記載した
- [x] Part 2 に current contract / target delta / 型 / API / 使用例 / エラーハンドリング / エッジケース / 設定一覧を記載した
- [x] `@repo/shared/types/skillCreator` の公開経路根拠を `packages/shared/package.json` で明示した
- [x] NON_VISUAL の代替証跡を Phase 11 文書参照として明示した
