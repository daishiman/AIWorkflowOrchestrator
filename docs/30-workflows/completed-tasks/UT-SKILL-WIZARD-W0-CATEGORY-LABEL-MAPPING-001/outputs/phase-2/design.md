# Phase 2: 設計

## メタ情報

| 項目           | 値                                                |
| -------------- | ------------------------------------------------- |
| ドキュメントID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001-PH2 |
| 作成日         | 2026-04-18                                        |
| ステータス     | PASS                                              |
| 担当フェーズ   | Phase 2（設計）                                   |
| 前フェーズ     | Phase 1（要件定義）                               |
| 後続フェーズ   | Phase 3（設計レビュー）                           |

## 実装設計

P50 チェックにより実装済みであることを確認した上で、設計方針を以下に記録する。

### 1. `SKILL_CATEGORY_LABELS` の設計方針

#### 型パターン

```typescript
export const SKILL_CATEGORY_LABELS = {
  automation: "自動化",
  "external-integration": "外部連携",
  "data-analysis": "データ分析",
  "code-support": "コードサポート",
  other: "その他",
} as const satisfies Record<SkillCategory, string>;
```

**設計上の決定事項:**

| 決定項目                                  | 採用内容 | 理由                                                                      |
| ----------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `as const`                                | 採用     | 各値をリテラル型として固定し、意図しない値の上書きを防ぐ                  |
| `satisfies Record<SkillCategory, string>` | 採用     | AC-3: `SkillCategory` 追加時の型エラーによる未定義ラベル検出を実現する    |
| 型アノテーション（`: Record<...>`）       | 不採用   | `satisfies` で十分。型アノテーションは推論精度を下げるため採用しない      |
| `as const` + `satisfies` の組み合わせ     | 採用     | TypeScript 4.9 以降の推奨パターン。型安全かつ値の精度（リテラル型）を維持 |

#### AC-3 達成の仕組み

`satisfies Record<SkillCategory, string>` により、`SkillCategory` union に新しい値（例: `"notification"`）が追加された場合、`SKILL_CATEGORY_LABELS` に対応エントリがなければ TypeScript がコンパイルエラーを発生させる。これにより、型チェック（`pnpm --filter @repo/shared typecheck`）を CI で実行することで未定義ラベルを早期検出できる。

### 2. `getSkillCategoryLabel()` 関数の API 設計

```typescript
export function getSkillCategoryLabel(category: SkillCategory): string {
  return SKILL_CATEGORY_LABELS[category];
}
```

**設計上の決定事項:**

| 決定項目                     | 採用内容                      | 理由                                                                                                 |
| ---------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| 引数型                       | `SkillCategory`（union type） | 不正なカテゴリ値を型レベルで排除                                                                     |
| 戻り値型                     | `string`                      | UI ラベルとして使用するため `string` で十分                                                          |
| Optional チェーン（`?.`）    | 不採用                        | `SkillCategory` 型引数は `SKILL_CATEGORY_LABELS` の全キーを網羅するため実行時に undefined にならない |
| デフォルト値フォールバック   | 不採用                        | 型安全で網羅されているため不要。フォールバックは型の網羅性を損なう                                   |
| 関数 vs オブジェクト直接参照 | 関数も提供                    | UI コンポーネントから `getSkillCategoryLabel(category)` の形で呼び出せるようにする（API の明確化）   |

### 3. エクスポートポリシー

| エクスポート先                    | 状態               | 理由                                                                     |
| --------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `@repo/shared/types/skillCreator` | エクスポート済み   | サブパスエクスポートとして `skillCreator.ts` から直接 `export` する      |
| root `@repo/shared`（`index.ts`） | エクスポートしない | `skill.ts` に既存の `SkillCategory` が存在するため名前衝突を回避する方針 |

## 型安全設計

### `satisfies` キーワードによる網羅性チェック

TypeScript 4.9 で導入された `satisfies` 演算子を使用することで、以下の両立を実現している。

1. **型安全性**: オブジェクトが `Record<SkillCategory, string>` を満たすことをコンパイル時に検証
2. **推論精度**: `as const` により各値がリテラル型（`"自動化"` など）として推論される（`string` への拡大が起きない）

### 型定義との依存関係

```
SkillCategory（行 948-953）
    ↓ satisfies Record<SkillCategory, string>
SKILL_CATEGORY_LABELS（行 960-966）
    ↓ インデックスアクセス
getSkillCategoryLabel（行 973-975）
```

`SkillCategory` が変更された場合、`SKILL_CATEGORY_LABELS` の `satisfies` 制約がコンパイルエラーを発生させるため、連鎖的な修正漏れを防止できる。

## 関連ファイルと依存関係

| ファイル                                                          | 依存方向      | 内容                                       |
| ----------------------------------------------------------------- | ------------- | ------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                       | 実装本体      | 定数・関数の定義（行 948-975）             |
| `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | テスト → 実装 | 全カテゴリ・関数の検証                     |
| `packages/shared/package.json`                                    | 公開経路定義  | `./types/skillCreator` subpath export      |
| `packages/shared/tsup.config.ts`                                  | build entry   | `src/types/skillCreator.ts` を dist へ出力 |

## テスト設計概要

| テストケース                   | 検証内容                                                  | AC   |
| ------------------------------ | --------------------------------------------------------- | ---- |
| 各カテゴリの日本語ラベル値     | `SKILL_CATEGORY_LABELS.automation === "自動化"` など 5 件 | AC-1 |
| 全カテゴリの網羅確認           | `Object.keys` の長さが 5 であること                       | AC-1 |
| 関数の戻り値確認               | `getSkillCategoryLabel("automation") === "自動化"` など   | AC-2 |
| 全カテゴリで string 型を返す   | `typeof getSkillCategoryLabel(cat) === "string"`          | AC-2 |
| 空文字列・undefined でないこと | `label.length > 0` かつ `label !== undefined`             | AC-1 |

## 完了条件チェックリスト

| チェック項目                                                                             | 状態 |
| ---------------------------------------------------------------------------------------- | ---- |
| `SKILL_CATEGORY_LABELS` が `as const satisfies Record<SkillCategory, string>` で定義済み | PASS |
| `getSkillCategoryLabel` が `SkillCategory` を受け取り `string` を返す                    | PASS |
| 両シンボルが `skillCreator.ts` から `export` されている                                  | PASS |
| root `@repo/shared` には含めない方針が守られている                                       | PASS |
| `SkillCategory` 追加時に型エラーが発生する設計になっている                               | PASS |
