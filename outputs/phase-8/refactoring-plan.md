# Phase 8: リファクタリング計画 — UT-SKILL-WIZARD-W2-seq-03b

## 実施内容

### 1. エクスポートのグループ化コメント整理

`wizard/index.ts` は変更後すでに読みやすい順序になっている。
追加のグループ化コメントは不要と判断（コードの自己説明性が高い）。

### 2. 廃止ファイルの処理

`DescribeStep.tsx` に `@deprecated` JSDoc を付与済み。
`ConfigureStep.tsx` はすでに削除済みのため対応不要。

### 3. 型の重複解消

- Before: `wizard/index.ts` が `GenerationMode` をインライン定義 + `GenerateStep.tsx` も同型を定義
- After: `wizard/index.ts` は `GenerateStep.tsx` からの再転送のみ（Single Source of Truth）

## 変更不要と判断した項目

- `InterviewProgressBar` / `ApplySummaryCard` のエクスポート順序: 仕様外だが既存の順序を維持する
- コメントブロックの追加: 現状のシンプルな barrel export として十分

## 判定

リファクタリング実施済み（`GenerationMode` の Single Source of Truth 化）。追加変更なし。
