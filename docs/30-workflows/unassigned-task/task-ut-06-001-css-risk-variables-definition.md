# UT-06-001-CSS-RISK-VARS: CSS リスクレベル変数定義

issue_number: 1921

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | UT-06-001-CSS-RISK-VARS                                        |
| 検出元     | UT-06-001 (tool-risk-config-implementation) エレガンスレビュー |
| 優先度     | medium                                                         |
| 分類       | 実装タスク                                                     |
| 関連タスク | UT-06-004 (PermissionDialog UI実装)                            |
| 作成日     | 2026-03-16                                                     |

## 概要

`TOOL_RISK_CONFIG` の `headerColorToken` フィールドが参照する CSS 変数 `--risk-low`、`--risk-medium`、`--risk-high` がプロジェクト内のどの CSS/Tailwind 設定ファイルにも定義されていない。PermissionDialog で使用される前に、これらの CSS 変数をデザイントークンとして定義する必要がある。

## 背景

- `packages/shared/src/constants/security.ts` の `TOOL_RISK_CONFIG` で `headerColorToken` に `"--risk-low"` / `"--risk-medium"` / `"--risk-high"` が設定済み
- 型は `\`--risk-${RiskLevel}\`` テンプレートリテラル型で3つの値のみ許可
- しかし、実際の CSS 変数定義がなく、PermissionDialog が参照した際に `undefined` となる

## 受入基準

1. CSS 変数 `--risk-low`、`--risk-medium`、`--risk-high` がライトモード・ダークモードの両方で定義されている
2. 値は Apple HIG カラーパレット準拠（01-architecture.md 参照）
3. Tailwind CSS の設定で参照可能
4. UT-06-004 (PermissionDialog) から `var(--risk-low)` 等で参照できる

## 推奨実装先

- `apps/desktop/src/renderer/styles/globals.css` または同等のグローバルCSS
- 推奨カラー値:
  - `--risk-low`: systemGreen 系（#34C759 / #30D158）
  - `--risk-medium`: systemOrange 系（#FF9500 / #FF9F0A）
  - `--risk-high`: systemRed 系（#FF3B30 / #FF453A）

## 備考

本タスクは UT-06-004 の前提となる。UT-06-004 着手前に完了するか、UT-06-004 のスコープに統合することも可能。
