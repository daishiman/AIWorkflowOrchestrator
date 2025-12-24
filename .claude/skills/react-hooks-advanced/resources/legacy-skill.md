---
name: .claude/skills/react-hooks-advanced/SKILL.md
description: |
  React Hooksの高度な使用パターンと最適化技術を専門とするスキル。
  ダン・アブラモフの思想に基づき、予測可能で効率的な状態管理を実現します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/react-hooks-advanced/resources/dependency-array-patterns.md`: 完全性原則、ESLint準拠、無限ループと古いクロージャ問題の解決法
  - `.claude/skills/react-hooks-advanced/resources/hooks-selection-guide.md`: Hooks選択ガイド
  - `.claude/skills/react-hooks-advanced/resources/memoization-strategies.md`: useCallback/useMemo/React.memoの測定駆動最適化と効果的パターン
  - `.claude/skills/react-hooks-advanced/resources/use-reducer-patterns.md`: useReducerパターン
  - `.claude/skills/react-hooks-advanced/scripts/analyze-hooks-usage.mjs`: React Hooks使用状況分析スクリプト
  - `.claude/skills/react-hooks-advanced/templates/custom-hook-template.md`: カスタムフックテンプレート
  - `.claude/skills/react-hooks-advanced/templates/use-reducer-template.md`: useReducerテンプレート

  専門分野:
  - Hooks使い分け: useState, useEffect, useCallback, useMemo, useReducerの適切な選択
  - 依存配列管理: ESLint exhaustive-depsルール準拠、依存配列の最適化
  - メモ化戦略: 不要な再レンダリング防止、パフォーマンス最適化
  - useReducer設計: 複雑な状態遷移ロジックの管理

  使用タイミング:
  - React Hooksの最適な使い分けを判断する時
  - useEffectの依存配列を設計する時
  - パフォーマンス最適化のためのメモ化戦略を検討する時
  - 複雑な状態管理でuseReducerを活用する時

  Use proactively when implementing React state management, optimizing renders,
  or designing complex hook patterns.
version: 1.0.0
---

# React Hooks Advanced

## 概要

このスキルは、Redux の開発者であり React Core Team メンバーであるダン・アブラモフの思想に基づき、
React Hooks を効果的に活用するための高度なパターンと最適化技術を提供します。

**核心哲学**: 予測可能性、不変性、関心の分離

**主要な価値**:

- 各 Hook の特性を理解し、適切に使い分けることでコードの品質を向上
- 依存配列の正確な管理による予測可能な副作用の制御
- 測定に基づいた最適化による効率的なレンダリング

## リソース構造

```
react-hooks-advanced/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── hooks-selection-guide.md               # Hooks選択ガイド
│   ├── dependency-array-patterns.md           # 依存配列パターン
│   ├── memoization-strategies.md              # メモ化戦略
│   └── use-reducer-patterns.md                # useReducerパターン
├── scripts/
│   └── analyze-hooks-usage.mjs                # Hooks使用状況分析スクリプト
└── templates/
    ├── custom-hook-template.md                # カスタムフックテンプレート
    └── use-reducer-template.md                # useReducerテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Hooks選択ガイド
cat .claude/skills/react-hooks-advanced/resources/hooks-selection-guide.md

# 依存配列パターン
cat .claude/skills/react-hooks-advanced/resources/dependency-array-patterns.md

# メモ化戦略
cat .claude/skills/react-hooks-advanced/resources/memoization-strategies.md

# useReducerパターン
cat .claude/skills/react-hooks-advanced/resources/use-reducer-patterns.md
```

### スクリプト実行

```bash
# Hooks使用状況分析
node .claude/skills/react-hooks-advanced/scripts/analyze-hooks-usage.mjs <file.tsx>
```

### テンプレート参照

```bash
# カスタムフックテンプレート
cat .claude/skills/react-hooks-advanced/templates/custom-hook-template.md

# useReducerテンプレート
cat .claude/skills/react-hooks-advanced/templates/use-reducer-template.md
```

## いつ使うか

### シナリオ 1: Hooks 選択の判断

**状況**: useState と useReducer のどちらを使うべきか迷っている

**適用条件**:

- [ ] 状態が 3 つ以上の関連する値を持つ
- [ ] 状態更新のロジックが複雑
- [ ] 次の状態が前の状態に依存する

**期待される成果**: 適切な Hook の選択と実装パターン

### シナリオ 2: 依存配列の最適化

**状況**: useEffect が意図しないタイミングで実行される

**適用条件**:

- [ ] ESLint exhaustive-deps の警告が出ている
- [ ] 依存配列の設計が不明確
- [ ] 無限ループが発生している

**期待される成果**: 正確な依存配列設計と安定した副作用実行

### シナリオ 3: パフォーマンス最適化

**状況**: 不要な再レンダリングが発生している

**適用条件**:

- [ ] React DevTools Profiler で過剰なレンダリングを確認
- [ ] コールバック関数が子コンポーネントに渡されている
- [ ] 計算コストの高い処理がレンダリング毎に実行されている

**期待される成果**: 測定に基づいた最適なメモ化戦略

## 知識領域

### 領域 1: Hooks 使い分けの判断基準

各 Hook の特性と最適な使用ケース:

| Hook        | 主な用途           | 選択基準                               |
| ----------- | ------------------ | -------------------------------------- |
| useState    | シンプルな状態管理 | 単一の値または関連性の低い複数の値     |
| useReducer  | 複雑な状態管理     | 関連する複数の状態、複雑な更新ロジック |
| useEffect   | 副作用の管理       | データフェッチ、購読、手動 DOM 操作    |
| useCallback | 関数のメモ化       | 子コンポーネントへのコールバック渡し   |
| useMemo     | 値のメモ化         | 計算コストの高い値の再計算防止         |
| useRef      | 可変参照の保持     | DOM 参照、再レンダリングを起こさない値 |

**詳細は**: `resources/hooks-selection-guide.md` を参照

### 領域 2: 依存配列管理

**原則**:

1. **完全性**: すべての外部変数を依存配列に含める
2. **ESLint 準拠**: exhaustive-deps ルールに従う
3. **意図の明確化**: 空配列の場合はコメントで意図を明記

**パターン**:

- 依存配列なし: 毎回実行
- 空配列`[]`: マウント時のみ実行
- 依存ありの配列: 依存値の変化時に実行

**詳細は**: `resources/dependency-array-patterns.md` を参照

### 領域 3: メモ化戦略

**原則**: 測定してから最適化する

**useCallback 適用基準**:

- コールバックを子コンポーネントに渡す場合
- 子コンポーネントが React.memo でラップされている
- 依存配列が頻繁に変わらない

**useMemo 適用基準**:

- 計算コストが高い処理（O(n)以上）
- 大きなデータ構造の変換
- 参照同一性が重要な場合

**詳細は**: `resources/memoization-strategies.md` を参照

### 領域 4: useReducer パターン

**適用基準**:

- 状態更新ロジックが複雑
- 次の状態が前の状態に依存
- 複数の状態値が関連している
- テスト容易性を高めたい

**設計原則**:

- アクションは「何が起こったか」を記述
- リデューサーは純粋関数
- 状態の形状はフラットに保つ

**詳細は**: `resources/use-reducer-patterns.md` を参照

## ワークフロー

### Phase 1: 現状分析

1. 既存の Hooks 使用状況を確認
2. パフォーマンス問題の有無を測定
3. 改善が必要な箇所を特定

### Phase 2: Hook 選択

1. 状態の複雑さを評価
2. 適切な Hook を選択
3. 依存配列を設計

### Phase 3: 実装

1. 選択した Hook で実装
2. ESLint exhaustive-deps を確認
3. 必要に応じてカスタムフックに抽出

### Phase 4: 最適化

1. React DevTools Profiler で測定
2. 必要な箇所のみメモ化を適用
3. 最適化後の効果を再測定

## 設計原則

### 予測可能性の原則

同じ入力に対して常に同じ出力を返す。副作用は useEffect で明示的に管理する。

### 不変性の原則

状態を直接変更せず、常に新しいオブジェクトを生成する。

### 最小状態の原則

導出可能な値は状態として保持せず、計算で求める。

### 測定駆動の原則

最適化は測定に基づいて行い、早すぎる最適化を避ける。

## 関連スキル

- `.claude/skills/custom-hooks-patterns/SKILL.md` - カスタムフック設計
- `.claude/skills/state-lifting/SKILL.md` - 状態の持ち上げ
- `.claude/skills/data-fetching-strategies/SKILL.md` - データフェッチ戦略
- `.claude/skills/error-boundary/SKILL.md` - エラーハンドリング

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
