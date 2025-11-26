---
name: tdd-red-green-refactor
description: |
  ケント・ベックのテスト駆動開発（TDD）サイクルを専門とするスキル。
  Red-Green-Refactorサイクルにより、テストファーストで高品質なコードを実装します。

  専門分野:
  - Red: 失敗するテストを先に書く
  - Green: テストを通す最小限のコードを実装
  - Refactor: テストを通した状態でコードを改善
  - テスト命名規則: Given-When-Then、Arrange-Act-Assert

  使用タイミング:
  - 新機能を実装する前にテストを書きたい時
  - バグ修正時に再現テストを先に書きたい時
  - リファクタリングの安全網としてテストを整備したい時
  - テストファーストの実践方法を確認したい時

  Use proactively when implementing features with TDD, writing tests first, or improving test coverage.
version: 1.0.0
---

# TDD Red-Green-Refactor

## 概要

このスキルは、ケント・ベックが提唱したテスト駆動開発（TDD）の実践方法を提供します。
TDDは「テストを先に書き、そのテストを通す最小限のコードを実装し、その後リファクタリングで改善する」
サイクルを繰り返す開発手法です。

**核心原則**:
- テストは実装の仕様書となる
- 小さなステップで確実に進む
- 常に動作するコードを維持する

**対象ユーザー**:
- ビジネスロジック実装エージェント（@logic-dev）
- ユニットテスト担当（@unit-tester）
- 品質を重視する開発者

## リソース構造

```
tdd-red-green-refactor/
├── SKILL.md                              # 本ファイル
├── resources/
│   ├── red-phase.md                      # Redフェーズ詳細ガイド
│   ├── green-phase.md                    # Greenフェーズ詳細ガイド
│   ├── refactor-phase.md                 # Refactorフェーズ詳細ガイド
│   ├── test-naming.md                    # テスト命名規則
│   └── tdd-anti-patterns.md              # TDDアンチパターン
├── scripts/
│   └── analyze-coverage.mjs              # テストカバレッジ分析
└── templates/
    └── test-template.md                  # テストファイルテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Redフェーズ詳細
cat .claude/skills/tdd-red-green-refactor/resources/red-phase.md

# Greenフェーズ詳細
cat .claude/skills/tdd-red-green-refactor/resources/green-phase.md

# Refactorフェーズ詳細
cat .claude/skills/tdd-red-green-refactor/resources/refactor-phase.md

# テスト命名規則
cat .claude/skills/tdd-red-green-refactor/resources/test-naming.md

# TDDアンチパターン
cat .claude/skills/tdd-red-green-refactor/resources/tdd-anti-patterns.md
```

### スクリプト実行

```bash
# テストカバレッジ分析
node .claude/skills/tdd-red-green-refactor/scripts/analyze-coverage.mjs src/features/
```

### テンプレート参照

```bash
# テストファイルテンプレート
cat .claude/skills/tdd-red-green-refactor/templates/test-template.md
```

## Red-Green-Refactorサイクル

### Phase 1: Red（レッド）

**目的**: 失敗するテストを書いて、実装すべき仕様を明確化

**手順**:
1. 実装したい機能の最小単位を決定
2. その機能を検証するテストを書く
3. テストを実行して失敗を確認

**判断基準**:
- [ ] テストが具体的で検証可能か？
- [ ] テストが適切な理由で失敗しているか？
- [ ] 失敗メッセージが明確か？

**詳細**: `resources/red-phase.md`

### Phase 2: Green（グリーン）

**目的**: テストを通す最小限のコードを実装

**手順**:
1. テストを通すための最小限のコードを書く
2. 「汚くても良い」の精神で、まずは動かす
3. テストがグリーンになることを確認

**判断基準**:
- [ ] テストが通っているか？
- [ ] 最小限の実装になっているか？
- [ ] 過剰な実装をしていないか（YAGNI）？

**詳細**: `resources/green-phase.md`

### Phase 3: Refactor（リファクタリング）

**目的**: テストを通した状態でコードを改善

**手順**:
1. 重複を排除
2. 命名を改善
3. 構造を最適化
4. 各変更後にテストを実行

**判断基準**:
- [ ] テストが通り続けているか？
- [ ] コードの可読性が向上したか？
- [ ] 重複が排除されたか？

**詳細**: `resources/refactor-phase.md`

## テスト命名規則

### Given-When-Then形式

**構造**:
- **Given**: 前提条件
- **When**: アクション
- **Then**: 期待結果

### Arrange-Act-Assert形式

**構造**:
- **Arrange**: テストデータの準備
- **Act**: テスト対象の実行
- **Assert**: 結果の検証

### 命名パターン

**推奨形式**: `should + 期待動作 + when + 条件`

**具体例**:
- `should return true when input is valid`
- `should throw error when user not found`
- `should calculate total including tax`

**詳細**: `resources/test-naming.md`

## TDDの利点

### 品質面

- **バグの早期発見**: 実装前にテストを書くため、仕様の曖昧さが明確になる
- **回帰防止**: テストスイートがセーフティネットとして機能
- **設計改善**: テスト可能な設計が自然に生まれる

### 開発効率面

- **デバッグ時間削減**: 問題が小さい単位で発見される
- **自信を持った変更**: テストがあるので安心してリファクタリングできる
- **ドキュメント効果**: テストが実装の仕様書になる

## ワークフロー

### 新機能実装時

```
1. 機能要件を理解
   ↓
2. [Red] 最初のテストを書く
   ↓
3. [Green] 最小限の実装
   ↓
4. [Refactor] コード改善
   ↓
5. 2-4を繰り返す
   ↓
6. すべての要件がテストでカバーされたら完了
```

### バグ修正時

```
1. バグを再現するテストを書く（Red）
   ↓
2. テストが失敗することを確認
   ↓
3. バグを修正（Green）
   ↓
4. テストが通ることを確認
   ↓
5. 必要ならリファクタリング
```

## ベストプラクティス

### すべきこと

1. **小さなステップで進める**:
   - 一度に一つのテストだけを追加
   - 各テストは一つのことだけを検証

2. **テストを先に書く**:
   - 実装前にテストを書く習慣をつける
   - テストが仕様書になることを意識

3. **リファクタリングを怠らない**:
   - Greenになったらすぐリファクタリング
   - 技術的負債を貯めない

### 避けるべきこと

1. **複数のテストを同時に書く**:
   - ❌ 10個のテストを書いてから実装
   - ✅ 1個ずつテスト→実装を繰り返す

2. **テストを後回しにする**:
   - ❌ 「後でテストを書く」
   - ✅ テストファーストを徹底

3. **過剰な実装**:
   - ❌ 「将来必要になるかも」で余計な機能を追加
   - ✅ テストで要求された機能だけを実装

**詳細**: `resources/tdd-anti-patterns.md`

## 関連スキル

- **refactoring-techniques** (`.claude/skills/refactoring-techniques/SKILL.md`): Refactorフェーズで使用
- **clean-code-practices** (`.claude/skills/clean-code-practices/SKILL.md`): 可読性向上
- **test-doubles** (`.claude/skills/test-doubles/SKILL.md`): モック・スタブの使用

## メトリクス

### テストカバレッジ

**目標**: 80%以上

### テスト実行時間

**目標**: ユニットテストは1秒以内

### テスト/実装比率

**目安**: 実装コード100行あたりテスト80-120行

## 参考文献

- **『テスト駆動開発』** ケント・ベック著
  - 第1部: The Money Example
  - 第2部: The xUnit Example
  - 第3部: Patterns for Test-Driven Development

- **『実践テスト駆動開発』** Steve Freeman, Nat Pryce著
  - Growing Object-Oriented Software, Guided by Tests

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - ケント・ベックのTDDサイクル |
