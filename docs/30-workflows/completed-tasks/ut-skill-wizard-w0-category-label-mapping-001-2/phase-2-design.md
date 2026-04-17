# Phase 2: 設計

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 2                                             |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 1                                       |
| 後続Phase  | Phase 3                                       |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

`SKILL_CATEGORY_LABELS` 定数と `getSkillCategoryLabel()` 関数のインターフェース・配置場所・型設計を確定する。

## 実行タスク

- インターフェース設計: 定数・関数のシグネチャ確定
- 配置場所の決定: 既存ファイルへの追加 vs 新規ファイル
- 型安全性設計: `Record<SkillCategory, string>` 型の活用方針
- 検証マトリクス: テスト対象コマンド一覧の定義

## 参照資料

| 資料名                   | パス                                         | 用途                   |
| ------------------------ | -------------------------------------------- | ---------------------- |
| Phase 1 成果物           | `outputs/phase-1/requirements-definition.md` | 要件・AC参照           |
| skillCreator.ts          | `packages/shared/src/types/skillCreator.ts`  | 追加先ファイル         |
| 既存エクスポートパターン | `packages/shared/package.json`               | エクスポート方法の確認 |

## 実行手順

### 1. 配置場所の決定

**方針**: `packages/shared/src/types/skillCreator.ts` の末尾に追加する。

理由:

- `SkillCategory` 型と同一ファイルに配置することで、型変更時に定数更新の漏れを防ぐ
- 新規ファイル作成は不要（小規模タスク）
- `@repo/shared/types/skillCreator` subpath export に閉じる（root barrel 触らない: `[Feedback W0-01]`）

### 2. インターフェース設計

#### 2-1. 定数設計

```typescript
/**
 * SkillCategory の UI表示用日本語ラベルマッピング。
 * Record<SkillCategory, string> 型により、SkillCategory に新値が追加された場合に
 * TypeScript の型チェックで未定義ラベルを検出できる。
 */
export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  automation: "自動化",
  "external-integration": "外部連携",
  "data-analysis": "データ分析",
  "code-support": "コードサポート",
  other: "その他",
} as const;
```

#### 2-2. 関数設計

```typescript
/**
 * SkillCategory に対応する日本語表示ラベルを返す。
 * @param category - SkillCategory 型の値
 * @returns 日本語ラベル文字列
 */
export function getSkillCategoryLabel(category: SkillCategory): string {
  return SKILL_CATEGORY_LABELS[category];
}
```

### 3. 型安全性設計

| 観点         | 設計方針                                                           |
| ------------ | ------------------------------------------------------------------ |
| 型網羅性     | `Record<SkillCategory, string>` により全値のラベルが必須（AC-3）   |
| immutability | `as const` アサーションで定数値の変更を防ぐ                        |
| エクスポート | Named export（`export const` / `export function`）で外部参照を明示 |

### 4. 検証マトリクス

| テスト対象     | テストコマンド                                                                               |
| -------------- | -------------------------------------------------------------------------------------------- |
| ユニットテスト | `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts` |
| 型チェック     | `pnpm --filter @repo/shared typecheck`                                                       |
| lint           | `pnpm --filter @repo/shared lint`                                                            |

### 5. 設計上の判断記録

| 判断事項                 | 採用方針                    | 理由                                          |
| ------------------------ | --------------------------- | --------------------------------------------- |
| 配置ファイル             | 既存 `skillCreator.ts` 末尾 | SkillCategory型と同居・管理コスト最小         |
| 関数 vs 定数直接参照     | 両方提供                    | 関数はAPI抽象化・定数は型安全な網羅チェック用 |
| `as const` アサーション  | 使用する                    | ラベル文字列の誤変更防止                      |
| ハイフン含む値のキー記法 | `"external-integration"`    | TypeScriptのquoted key記法で対応              |

## 統合テスト連携【必須】

| 判定項目             | 基準 | 結果    |
| -------------------- | ---- | ------- |
| ユニットテストLine   | 80%+ | pending |
| ユニットテストBranch | 60%+ | pending |
| 型チェック           | PASS | pending |

## 成果物

| 成果物 | パス                        | 説明                               |
| ------ | --------------------------- | ---------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | インターフェース・型設計・判断記録 |

## 完了条件

- [ ] 配置ファイルを `packages/shared/src/types/skillCreator.ts` に確定済み
- [ ] `SKILL_CATEGORY_LABELS` の型・値・`as const` 方針が確定済み
- [ ] `getSkillCategoryLabel()` のシグネチャが確定済み
- [ ] 型安全性設計（`Record<SkillCategory, string>`）が確定済み
- [ ] ハイフン含む値のキー記法方針が確定済み
- [ ] 検証マトリクスが定義済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 配置場所の決定
2. 定数インターフェース設計
3. 関数インターフェース設計
4. 型安全性設計
5. 設計判断の記録
6. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
