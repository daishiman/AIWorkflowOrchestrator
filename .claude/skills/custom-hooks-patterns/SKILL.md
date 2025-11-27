---
name: custom-hooks-patterns
description: |
    Reactカスタムフックの設計パターンと実装ベストプラクティスを専門とするスキル。
    再利用可能で保守性の高いカスタムフック作成を支援します。
    専門分野:
    - フック抽出: コンポーネントからロジックを抽出する判断基準
    - 設計パターン: 状態・副作用・イベント管理のパターン
    - 合成: フックの組み合わせと拡張
    - テスト: カスタムフックのテスト戦略
    使用タイミング:
    - コンポーネントのロジックを再利用したい時
    - 複雑な状態管理をカプセル化したい時
    - 副作用の処理を整理したい時
    - カスタムフックのテスト方法を知りたい時
    Use proactively when extracting logic into custom hooks,
    designing reusable stateful logic, or testing custom hooks.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/custom-hooks-patterns/resources/composition-patterns.md`: 小さなフックの組み合わせと拡張による合成パターン
  - `.claude/skills/custom-hooks-patterns/resources/design-patterns.md`: 状態管理・副作用・イベント処理の実装パターン集
  - `.claude/skills/custom-hooks-patterns/resources/extraction-criteria.md`: コンポーネントからフックを抽出する判断基準と評価方法
  - `.claude/skills/custom-hooks-patterns/resources/testing-strategies.md`: カスタムフックのテスト戦略とモック手法
  - `.claude/skills/custom-hooks-patterns/templates/advanced-hooks-template.md`: 高度なカスタムフックの実装テンプレート
  - `.claude/skills/custom-hooks-patterns/templates/basic-hooks-template.md`: 基本的なカスタムフックの実装テンプレート
  - `.claude/skills/custom-hooks-patterns/scripts/analyze-hook-candidates.mjs`: フック抽出候補を自動分析するスクリプト

version: 1.0.0
---

# Custom Hooks Patterns

## 概要

このスキルは、React カスタムフックの効果的な設計と実装パターンを提供します。
「関心の分離」と「再利用性」を軸に、保守性の高いカスタムフック作成を支援します。

**核心思想**: カスタムフックはロジックの再利用単位であり、UI から独立したステートフルロジック

**主要な価値**:

- ロジックの再利用による DRY 原則の実現
- テスト容易性の向上
- コンポーネントの責務の明確化

## リソース構造

```
custom-hooks-patterns/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── extraction-criteria.md                 # フック抽出の判断基準
│   ├── design-patterns.md                     # 設計パターン集
│   ├── composition-patterns.md                # フック合成パターン
│   └── testing-strategies.md                  # テスト戦略
├── scripts/
│   └── analyze-hook-candidates.mjs            # フック抽出候補分析
└── templates/
    ├── basic-hooks-template.md                # 基本フックテンプレート
    └── advanced-hooks-template.md             # 高度なフックテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# フック抽出基準
cat .claude/skills/custom-hooks-patterns/resources/extraction-criteria.md

# 設計パターン
cat .claude/skills/custom-hooks-patterns/resources/design-patterns.md

# 合成パターン
cat .claude/skills/custom-hooks-patterns/resources/composition-patterns.md

# テスト戦略
cat .claude/skills/custom-hooks-patterns/resources/testing-strategies.md
```

### スクリプト実行

```bash
# フック抽出候補分析
node .claude/skills/custom-hooks-patterns/scripts/analyze-hook-candidates.mjs <file.tsx>
```

### テンプレート参照

```bash
# 基本フックテンプレート
cat .claude/skills/custom-hooks-patterns/templates/basic-hooks-template.md

# 高度なフックテンプレート
cat .claude/skills/custom-hooks-patterns/templates/advanced-hooks-template.md
```

## いつ使うか

### シナリオ 1: ロジック抽出

**状況**: コンポーネント内のロジックを再利用したい

**適用条件**:

- [ ] 同じロジックが複数箇所で使われている
- [ ] ロジックが独立してテスト可能
- [ ] UI から分離可能

**期待される成果**: 再利用可能なカスタムフックの作成

### シナリオ 2: 複雑性の管理

**状況**: コンポーネントが肥大化している

**適用条件**:

- [ ] 複数の状態と副作用が混在
- [ ] テストが困難
- [ ] 責務が不明確

**期待される成果**: 責務ごとに分離されたカスタムフック群

### シナリオ 3: テスト戦略

**状況**: カスタムフックをテストしたい

**適用条件**:

- [ ] フックにテスト対象のロジックがある
- [ ] 副作用のモックが必要
- [ ] エッジケースの網羅が必要

**期待される成果**: 堅牢なテストスイート

## 知識領域

### 領域 1: 抽出の判断基準

| 基準   | 抽出する                 | 抽出しない             |
| ------ | ------------------------ | ---------------------- |
| 再利用 | 複数コンポーネントで使用 | 単一コンポーネント専用 |
| 複雑性 | 状態+副作用が絡む        | 単純な useState        |
| テスト | 独立テストが有益         | UI と密結合            |
| 責務   | 明確な単一責務           | 曖昧な境界             |

**詳細は**: `resources/extraction-criteria.md` を参照

### 領域 2: 設計パターン

**状態管理パターン**:

- useToggle: boolean 状態の切り替え
- useCounter: 数値状態の増減
- useForm: フォーム状態管理
- usePrevious: 前の値の保持

**副作用パターン**:

- useDebounce: 遅延実行
- useThrottle: 実行頻度制限
- useInterval: 定期実行
- useEventListener: イベント登録

**詳細は**: `resources/design-patterns.md` を参照

### 領域 3: 合成パターン

**合成の原則**:

- 小さなフックを組み合わせる
- 各フックは単一責務
- 依存関係を明示する

**例**: useUser = useAuth + useFetch + useLocalStorage

**詳細は**: `resources/composition-patterns.md` を参照

### 領域 4: テスト戦略

**テストアプローチ**:

- @testing-library/react-hooks の使用
- renderHook によるフックのレンダリング
- act()による状態更新のラップ
- モックによる副作用の制御

**詳細は**: `resources/testing-strategies.md` を参照

## ワークフロー

### Phase 1: 抽出候補の特定

1. コンポーネント内のロジックを洗い出す
2. 再利用可能性を評価
3. 抽出の費用対効果を判断

### Phase 2: インターフェース設計

1. 入力（引数）を定義
2. 出力（戻り値）を定義
3. 型を定義

### Phase 3: 実装

1. 状態の定義
2. 副作用の実装
3. ハンドラの定義
4. 戻り値のメモ化

### Phase 4: テスト

1. 基本動作のテスト
2. エッジケースのテスト
3. 副作用のテスト

## 設計原則

### 単一責務の原則

一つのフックは一つのことをする。
複数の責務は複数のフックに分割する。

### 合成優先の原則

大きなフックを作るより、小さなフックを組み合わせる。
再利用性とテスト容易性が向上する。

### 明示的インターフェースの原則

フックの入出力は明確にする。
暗黙的な依存関係を避ける。

### テストファーストの原則

フックのインターフェースをテストで検証する。
実装の詳細ではなく振る舞いをテストする。

## 関連スキル

- `.claude/skills/react-hooks-advanced/SKILL.md` - 組み込み Hooks の高度な使用
- `.claude/skills/state-lifting/SKILL.md` - 状態配置戦略
- `.claude/skills/data-fetching-strategies/SKILL.md` - データフェッチフック
- `.claude/skills/error-boundary/SKILL.md` - エラー処理フック

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
