---
name: .claude/skills/state-lifting/SKILL.md
description: |
  Reactにおける状態の持ち上げ（Lifting State Up）と状態配置戦略の専門スキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/state-lifting/resources/colocation-principles.md`: Colocation Principlesリソース
  - `.claude/skills/state-lifting/resources/context-patterns.md`: Context Patternsリソース
  - `.claude/skills/state-lifting/resources/prop-drilling-solutions.md`: Prop Drilling Solutionsリソース
  - `.claude/skills/state-lifting/resources/state-placement-guide.md`: State Placement Guideリソース

  - `.claude/skills/state-lifting/templates/compound-component-template.md`: Compound Componentテンプレート
  - `.claude/skills/state-lifting/templates/context-provider-template.md`: Context Providerテンプレート

  - `.claude/skills/state-lifting/scripts/analyze-state-structure.mjs`: Analyze State Structureスクリプト

version: 1.0.0
---

# State Lifting

## 概要

このスキルは、React における状態配置と状態共有の設計パターンを提供します。
「状態はそれを必要とする最も近い共通の親に配置する」という原則に基づき、
コンポーネントアーキテクチャを設計します。

**核心思想**: 状態は使用場所に最も近い場所に配置し、必要な場合のみ持ち上げる

**主要な価値**:

- 適切な状態配置によるコンポーネント設計の明確化
- Prop Drilling 問題の効果的な解決
- パフォーマンスを考慮した Context 設計

## リソース構造

```
state-lifting/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── state-placement-guide.md               # 状態配置判断ガイド
│   ├── colocation-principles.md               # コロケーション原則
│   ├── context-patterns.md                    # Context APIパターン
│   └── prop-drilling-solutions.md             # Prop Drilling解決策
├── scripts/
│   └── analyze-state-structure.mjs            # 状態構造分析スクリプト
└── templates/
    ├── context-provider-template.md           # Contextテンプレート
    └── compound-component-template.md         # コンパウンドコンポーネントテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# 状態配置ガイド
cat .claude/skills/state-lifting/resources/state-placement-guide.md

# コロケーション原則
cat .claude/skills/state-lifting/resources/colocation-principles.md

# Context APIパターン
cat .claude/skills/state-lifting/resources/context-patterns.md

# Prop Drilling解決策
cat .claude/skills/state-lifting/resources/prop-drilling-solutions.md
```

### スクリプト実行

```bash
# 状態構造分析
node .claude/skills/state-lifting/scripts/analyze-state-structure.mjs <file.tsx>
```

### テンプレート参照

```bash
# Contextプロバイダーテンプレート
cat .claude/skills/state-lifting/templates/context-provider-template.md

# コンパウンドコンポーネントテンプレート
cat .claude/skills/state-lifting/templates/compound-component-template.md
```

## いつ使うか

### シナリオ 1: 状態配置の判断

**状況**: 新しい状態をどこに配置すべきか迷っている

**適用条件**:

- [ ] 状態を使用するコンポーネントが特定されている
- [ ] 状態の更新頻度が把握されている
- [ ] コンポーネントツリーの構造が理解されている

**期待される成果**: 最適な状態配置の決定

### シナリオ 2: 状態の持ち上げ

**状況**: 複数のコンポーネントで同じ状態を共有したい

**適用条件**:

- [ ] 共有が必要なコンポーネントが明確
- [ ] 状態の所有者が決まっている
- [ ] 更新パターンが定義されている

**期待される成果**: 効果的な状態共有の実装

### シナリオ 3: Prop Drilling 解決

**状況**: 深いコンポーネント階層で props が多段階で渡されている

**適用条件**:

- [ ] Prop Drilling が 3 階層以上ある
- [ ] 中間コンポーネントが props を使用していない
- [ ] コードの保守性が低下している

**期待される成果**: 適切なパターンによる Prop Drilling 解消

## 知識領域

### 領域 1: 状態配置の判断基準

| 基準                 | ローカル  | 持ち上げ   | グローバル     |
| -------------------- | --------- | ---------- | -------------- |
| 使用コンポーネント数 | 1         | 2-5        | 多数           |
| 更新頻度             | 高頻度 OK | 中程度     | 低頻度推奨     |
| 永続性               | 不要      | 不要       | 必要な場合あり |
| アクセスパターン     | 単一      | 親子・兄弟 | 任意           |

**詳細は**: `resources/state-placement-guide.md` を参照

### 領域 2: コロケーション原則

**原則**: 状態は使用する場所の近くに配置する

```
状態を持ち上げすぎない
├── 不要な再レンダリングを防ぐ
├── コンポーネントの独立性を保つ
└── テストとデバッグを容易にする

必要な時だけ持ち上げる
├── 複数コンポーネントで共有が必要
├── 親が子の状態を制御する必要がある
└── 状態の同期が必要
```

**詳細は**: `resources/colocation-principles.md` を参照

### 領域 3: Context API パターン

**使用基準**:

- プロップドリリングが 3 階層以上
- 「グローバル」なデータ（テーマ、認証、言語）
- 頻繁に変更されないデータ

**パフォーマンス考慮**:

- Context を分割する（読み取り用/書き込み用）
- メモ化を活用する
- 更新範囲を最小化する

**詳細は**: `resources/context-patterns.md` を参照

### 領域 4: Prop Drilling 解決パターン

| パターン                   | 適用ケース               | 複雑性 |
| -------------------------- | ------------------------ | ------ |
| 状態の持ち上げ             | 共通の親がある           | 低     |
| コンポジション             | 中間コンポーネントが不要 | 低     |
| Context API                | グローバル的なデータ     | 中     |
| Render Props               | 柔軟な描画制御           | 中     |
| コンパウンドコンポーネント | 関連コンポーネント群     | 高     |

**詳細は**: `resources/prop-drilling-solutions.md` を参照

## ワークフロー

### Phase 1: 状態分析

1. 状態を使用するコンポーネントを特定
2. コンポーネントツリー内の位置を確認
3. 状態の更新頻度と使用パターンを分析

### Phase 2: 配置決定

1. コロケーション原則に基づいて初期配置を決定
2. 持ち上げが必要か判断
3. 持ち上げ先（共通の親）を特定

### Phase 3: 実装

1. 状態とハンドラを適切なコンポーネントに配置
2. props または Context で子に渡す
3. 必要に応じてメモ化を適用

### Phase 4: 検証

1. 再レンダリングの範囲を確認
2. コンポーネントの責務が明確か確認
3. テスト容易性を確認

## 設計原則

### 最小持ち上げの原則

状態は必要最小限の高さにのみ持ち上げる。
過度な持ち上げは不要な再レンダリングと複雑性を招く。

### コロケーションの原則

状態は、それを使用するコードの近くに配置する。
物理的な近さがコードの理解と保守を助ける。

### 単一責任の原則

各コンポーネントは一つの状態の「所有者」となる。
所有者が状態の更新を制御し、子は読み取りのみ。

### 明示的データフローの原則

データの流れを明示的に保つ。
暗黙的な状態共有より、明示的な props 渡しを優先。

## 関連スキル

- `.claude/skills/react-hooks-advanced/SKILL.md` - useState/useReducer 選択
- `.claude/skills/data-fetching-strategies/SKILL.md` - サーバー状態管理
- `.claude/skills/custom-hooks-patterns/SKILL.md` - 状態ロジックの抽出
- `.claude/skills/error-boundary/SKILL.md` - エラー状態の伝播

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
