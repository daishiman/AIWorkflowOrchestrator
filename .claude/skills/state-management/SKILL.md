---
name: state-management
description: |
  フロントエンド開発における状態管理パターンと実装戦略を専門とするスキル。React（Context API、Redux、Zustand、Jotai）、Vue（Pinia、Vuex）、グローバル状態管理、ローカル状態管理、非同期状態管理、最適化パターンを支援します。

  **Anchors**:
  • 『Learning React』（Alex Banks, Eve Porcello）/ 適用: React状態管理の基礎とHooksパターン / 目的: useStateとuseReducerの適切な使い分けと設計
  • 『Redux Essentials』（Redux公式ドキュメント）/ 適用: Redux Toolkitによる予測可能な状態管理 / 目的: アクション・リデューサー・セレクターの設計とミドルウェア統合
  • 『Recoil: State Management for React』（Facebook）/ 適用: Atomベース状態管理 / 目的: 細粒度の状態分割と非同期データフロー
  • 『Vue 3 Composition API』（Vue公式）/ 適用: Vue状態管理パターン / 目的: reactive・ref・computed・watchの使い分けとPinia統合
  • 『Domain-Driven Design』（Eric Evans）/ 適用: 状態モデリング / 目的: ドメインモデルと状態の整合性維持

  **Triggers**:
  • 状態管理ライブラリの選定が必要な時に使用
  • グローバル状態とローカル状態の設計が必要な時に使用
  • 非同期データフェッチと状態同期が必要な時に使用
  • 状態の正規化とパフォーマンス最適化が必要な時に使用
  • 複数コンポーネント間での状態共有が必要な時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# State Management

## 概要

フロントエンド開発における状態管理パターンと実装戦略を専門とするスキル。状態管理ライブラリの選定、設計パターンの適用、パフォーマンス最適化、テスト戦略を包括的に支援します。

詳細な手順や背景は `references/Level1_basics.md` から `references/Level4_expert.md` を段階的に参照してください。

## ワークフロー

### Phase 1: 要件分析と設計方針の決定

**目的**: 状態管理の要件を明確化し、適切なアプローチを選定する

**アクション**:

1. アプリケーションの状態要件を分析（スコープ、複雑度、非同期性）
2. 適切な状態管理ライブラリと戦略を選定
3. `references/Level1_basics.md` で基礎パターンを確認
4. `references/library-comparison.md` でライブラリ比較を参照

**Task**: `agents/analyze-state-requirements.md` を参照

**入力**:

- アプリケーション要件（機能、データフロー、パフォーマンス要求）
- 技術スタック（React/Vue、TypeScript有無、既存ライブラリ）

**出力**:

- 状態管理戦略ドキュメント
- ライブラリ選定理由
- 状態構造の設計案

### Phase 2: 状態設計とアーキテクチャ構築

**目的**: 状態の構造を設計し、データフローを定義する

**アクション**:

1. 状態の正規化とスライス分割を設計
2. `references/Level2_intermediate.md` で設計パターンを参照
3. `references/normalization-patterns.md` でデータ正規化を確認
4. `assets/state-structure-template.ts` を基にスキーマを作成

**Task**: `agents/design-state-structure.md` を参照

**入力**:

- Phase 1の設計案
- ドメインモデル定義
- データ依存関係

**出力**:

- 正規化された状態スキーマ
- スライス分割仕様
- データフロー図

### Phase 3: 実装とパフォーマンス最適化

**目的**: 状態管理ロジックを実装し、パフォーマンスを最適化する

**アクション**:

1. `assets/redux-slice-template.ts` や `assets/zustand-store-template.ts` を参照
2. `references/Level3_advanced.md` で最適化パターンを確認
3. `references/async-state-patterns.md` で非同期処理を実装
4. メモ化とセレクター最適化を適用

**Task**: `agents/implement-state-management.md` を参照

**入力**:

- Phase 2の状態設計
- コンポーネント要件
- 非同期API仕様

**出力**:

- 状態管理実装コード
- セレクター関数
- アクション/ミューテーション定義

### Phase 4: テストと検証

**目的**: 状態管理ロジックのテストと品質確認

**アクション**:

1. `references/Level4_expert.md` でテスト戦略を確認
2. `references/testing-strategies.md` でパターンを参照
3. `assets/state-test-template.ts` を基にテストを作成
4. `scripts/validate-state-management.mjs` で検証

**Task**: `agents/validate-state.md` を参照

**入力**:

- Phase 3の実装コード
- テスト要件
- パフォーマンス基準

**出力**:

- テストスイート
- パフォーマンス測定結果
- 品質レポート

### Phase 5: ドキュメント化と記録

**目的**: 実装を文書化し、ナレッジを蓄積する

**アクション**:

1. 状態管理ガイドを作成
2. 設計判断の理由を記録
3. `scripts/log_usage.mjs` で使用記録を保存

**Task**: `agents/document-state.md` を参照

## Task仕様ナビ

| Task                 | 概要                                | 対応する Phase | リソース                                                     |
| -------------------- | ----------------------------------- | -------------- | ------------------------------------------------------------ |
| 要件分析             | 状態管理の要件を分析し戦略を選定    | Phase 1        | Level1_basics.md, library-comparison.md                      |
| 状態構造設計         | 正規化とスライス分割を設計          | Phase 2        | Level2_intermediate.md, normalization-patterns.md            |
| Redux実装            | Redux Toolkitによる状態管理実装     | Phase 3        | Level2_intermediate.md, redux-slice-template.ts              |
| Zustand実装          | Zustandによる軽量状態管理実装       | Phase 3        | Level2_intermediate.md, zustand-store-template.ts            |
| Context API実装      | React Context APIによる状態共有実装 | Phase 3        | Level1_basics.md, context-pattern.md                         |
| 非同期状態管理       | 非同期データフェッチと状態同期      | Phase 3        | Level3_advanced.md, async-state-patterns.md                  |
| パフォーマンス最適化 | メモ化とセレクター最適化            | Phase 3        | Level3_advanced.md, performance-optimization.md              |
| テスト実装           | 状態管理ロジックのテスト作成        | Phase 4        | Level4_expert.md, testing-strategies.md, state-test-template |
| デバッグ戦略         | Redux DevTools等を使用したデバッグ  | Phase 4        | Level4_expert.md, debugging-guide.md                         |
| ドキュメント作成     | 状態管理ガイドと設計判断の記録      | Phase 5        | documentation-template.md                                    |

## ベストプラクティス

### すべきこと

- 状態は必要最小限に保ち、派生データはセレクターで計算する
- グローバル状態とローカル状態を適切に分離する
- 状態の更新は不変性を維持する（immutability）
- TypeScriptを活用して状態の型安全性を確保する
- セレクターにメモ化を適用してパフォーマンスを最適化する
- 非同期処理のローディング・エラー状態を明示的に管理する
- 状態の正規化を行い、データ重複を避ける
- テストカバレッジを高く保つ

### 避けるべきこと

- すべての状態をグローバルに配置する（過度な集中化）
- 状態を直接変更する（ミューテーション）
- 深いネストした状態構造を作る
- セレクター内で副作用を実行する
- useEffectで無限ループを引き起こす依存関係を設定する
- 過度に細かい状態分割（パフォーマンス劣化）
- 状態とpropsの重複管理
- エラーハンドリングを省略する

## リソース参照

### 段階的学習リソース

```bash
# Level 1: 基礎（useState, useReducer, Context API基礎）
cat .claude/skills/state-management/references/Level1_basics.md

# Level 2: 中級（Redux Toolkit, Zustand, 状態設計パターン）
cat .claude/skills/state-management/references/Level2_intermediate.md

# Level 3: 上級（パフォーマンス最適化, 非同期状態, 正規化）
cat .claude/skills/state-management/references/Level3_advanced.md

# Level 4: エキスパート（アーキテクチャパターン, 大規模アプリ, テスト戦略）
cat .claude/skills/state-management/references/Level4_expert.md
```

### パターン別リソース

```bash
# ライブラリ比較と選定
cat .claude/skills/state-management/references/library-comparison.md

# データ正規化パターン
cat .claude/skills/state-management/references/normalization-patterns.md

# 非同期状態管理
cat .claude/skills/state-management/references/async-state-patterns.md

# パフォーマンス最適化
cat .claude/skills/state-management/references/performance-optimization.md

# テスト戦略
cat .claude/skills/state-management/references/testing-strategies.md

# Context APIパターン
cat .claude/skills/state-management/references/context-pattern.md

# デバッグガイド
cat .claude/skills/state-management/references/debugging-guide.md
```

### テンプレート参照

```bash
# 状態構造テンプレート
cat .claude/skills/state-management/assets/state-structure-template.ts

# Redux Toolkit スライステンプレート
cat .claude/skills/state-management/assets/redux-slice-template.ts

# Zustand ストアテンプレート
cat .claude/skills/state-management/assets/zustand-store-template.ts

# Context + Hooks テンプレート
cat .claude/skills/state-management/assets/context-hooks-template.tsx

# テストテンプレート
cat .claude/skills/state-management/assets/state-test-template.ts

# ドキュメントテンプレート
cat .claude/skills/state-management/assets/documentation-template.md
```

### スクリプト実行

```bash
# 状態管理実装の検証
node .claude/skills/state-management/scripts/validate-state-management.mjs --help

# スキル自体の検証
node .claude/skills/state-management/scripts/validate-skill.mjs --help

# 使用ログの記録
node .claude/skills/state-management/scripts/log_usage.mjs --help
```

## 変更履歴

| Version | Date       | Changes                            |
| ------- | ---------- | ---------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に準拠した初期実装 |
