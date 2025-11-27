---
name: tdd-principles
description: |
  ケント・ベックが提唱したテスト駆動開発（TDD）の原則を体系化したスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/tdd-principles/resources/design-emergence.md`: Design Emergenceリソース
  - `.claude/skills/tdd-principles/resources/legacy-code-strategies.md`: Legacy Code Strategiesリソース
  - `.claude/skills/tdd-principles/resources/red-green-refactor.md`: Red Green Refactorリソース
  - `.claude/skills/tdd-principles/resources/small-steps.md`: Small Stepsリソース
  - `.claude/skills/tdd-principles/resources/test-first-principles.md`: Test First Principlesリソース

  - `.claude/skills/tdd-principles/templates/tdd-session-template.md`: Tdd Sessionテンプレート

  - `.claude/skills/tdd-principles/scripts/tdd-cycle-validator.mjs`: Tdd Cycle Validatorスクリプト

version: 1.0.0
---

# TDD Principles

## 概要

このスキルは、ケント・ベックが『テスト駆動開発』で体系化した TDD（Test-Driven Development）の原則と実践方法を提供します。

**核心思想**: テストを先に書き、そのテストを通過する最小限のコードを実装し、その後リファクタリングするサイクルを通じて、品質の高いコードを継続的に生産する。

**主要な価値**:

- 開発時の品質作り込み（後工程でのバグ発見コスト削減）
- テストが設計を駆動し、より良い API が出現
- リファクタリングの安全網としてのテスト群
- 実行可能なドキュメントとしてのテストコード

**対象エージェント**:

- **@unit-tester**: テスト設計・実装の観点から TDD 原則を活用
- **関連**: @logic-dev は `tdd-red-green-refactor` スキルで実装者視点の TDD を使用

## リソース構造

```
tdd-principles/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── red-green-refactor.md                  # RGRサイクルの詳細
│   ├── test-first-principles.md               # テストファースト原則
│   ├── small-steps.md                         # 小さなステップの実践
│   ├── legacy-code-strategies.md              # レガシーコード対応戦略
│   └── design-emergence.md                    # テスト駆動設計の出現
├── scripts/
│   └── tdd-cycle-validator.mjs                # TDDサイクル検証スクリプト
└── templates/
    └── tdd-session-template.md                # TDDセッションテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Red-Green-Refactorサイクル詳細
cat .claude/skills/tdd-principles/resources/red-green-refactor.md

# テストファースト原則
cat .claude/skills/tdd-principles/resources/test-first-principles.md

# 小さなステップの実践
cat .claude/skills/tdd-principles/resources/small-steps.md

# レガシーコード対応戦略
cat .claude/skills/tdd-principles/resources/legacy-code-strategies.md

# テスト駆動設計の出現
cat .claude/skills/tdd-principles/resources/design-emergence.md
```

### スクリプト実行

```bash
# TDDサイクルの妥当性検証
node .claude/skills/tdd-principles/scripts/tdd-cycle-validator.mjs <test-file>
```

### テンプレート参照

```bash
# TDDセッションテンプレート
cat .claude/skills/tdd-principles/templates/tdd-session-template.md
```

---

## 知識領域 1: Red-Green-Refactor サイクル

TDD の核心は 3 つのフェーズからなる反復サイクルです。

### 1. Red（赤）- 失敗するテストを書く

**目的**: 期待される振る舞いを明確に定義する

**原則**:

- テストは最初に失敗しなければならない
- 失敗メッセージは何が期待されているかを明確に伝える
- 一度に一つの振る舞いのみをテスト

**判断基準**:

- [ ] テストは実装前に書かれているか？
- [ ] テストは期待通り失敗しているか？
- [ ] エラーメッセージは何を修正すべきか明確に示しているか？

### 2. Green（緑）- テストを通す最小限の実装

**目的**: テストを成功させる最もシンプルなコードを書く

**原則**:

- テストを通すためだけのコードを書く
- 「動作するきれいなコード」は後回し
- 過剰な実装は避ける

**判断基準**:

- [ ] 実装はテストを通す最小限か？
- [ ] 不要な機能を追加していないか？
- [ ] すべてのテストが成功しているか？

### 3. Refactor（リファクタ）- コードを改善する

**目的**: テストを通したまま、コードの品質を向上させる

**原則**:

- 動作を変えずに構造を改善
- DRY（Don't Repeat Yourself）の適用
- 命名の改善、抽象化の導入

**判断基準**:

- [ ] リファクタリング後もすべてのテストが成功するか？
- [ ] コードの重複は排除されたか？
- [ ] 可読性は向上したか？

---

## 知識領域 2: テストファースト原則

### 原則 1: テストは仕様である

テストを先に書くことで、実装すべき振る舞いを明確に定義できます。

**メリット**:

- 仕様の曖昧さを早期発見
- API の使いやすさを事前検証
- 実行可能なドキュメントの自動生成

### 原則 2: シンプルな設計の創発

テストファーストで開発することで、テスト可能な（=疎結合な）設計が自然に生まれます。

**創発パターン**:

- 依存性注入の自然な導入
- 単一責任原則への準拠
- インターフェースの明確化

### 原則 3: 勇気あるリファクタリング

テストがあることで、安心してコードを改善できます。

**心理的効果**:

- 変更への恐怖の軽減
- 継続的改善の習慣化
- 技術的負債の積極的返済

---

## 知識領域 3: 小さなステップ

### 原則: 一度に一つのことだけを変更

大きな変更は小さなステップの連続として実現します。

**ステップサイズの指標**:

- 1 つのテストケース = 1 つの振る舞い
- 1 つのリファクタリング = 1 つの改善
- 常にグリーン状態を維持

### 実践パターン

**Fake It Till You Make It**:

1. ハードコードした値でテストを通す
2. 段階的に一般化
3. 最終的に正しい実装に到達

**Triangulation**:

1. 最初のテストを書く
2. 別のケースのテストを追加
3. 両方を通す一般化された実装

**Obvious Implementation**:

- 実装が明白な場合は直接書く
- ただし失敗したら「Fake It」に戻る

---

## 知識領域 4: レガシーコード対応

### 接合部（Seams）の概念

テストのために振る舞いを変更できるポイントを作成します。

**Seam の種類**:

- **Object Seam**: オブジェクトを差し替え可能にする
- **Preprocessing Seam**: 条件付きコンパイル
- **Link Seam**: リンク時の差し替え

### キャラクタライゼーションテスト

現在の振る舞いを記録するテストから始めます。

**手順**:

1. 現在の出力を記録するテストを書く
2. テストが通ることを確認
3. 安全にリファクタリングを開始

---

## 知識領域 5: 設計の創発

### TDD が促進する設計原則

**SOLID 原則への自然な準拠**:

- **S（単一責任）**: テストしやすい = 責任が単一
- **O（開放閉鎖）**: 拡張でテストを追加
- **L（リスコフ）**: 派生クラスのテスト容易性
- **I（インターフェース分離）**: 必要なメソッドのみ
- **D（依存性逆転）**: テストダブル注入のため

### Simple Design（シンプル設計）

ケント・ベックの 4 つの規則:

1. **テストをパスする**: すべてのテストが成功
2. **意図を表現する**: コードが何をしているか明確
3. **重複を排除する**: DRY の適用
4. **最小限の要素**: 不要なものを含まない

---

## ワークフロー

### Phase 1: テスト作成（Red）

**入力**: 実装すべき機能の仕様
**出力**: 失敗するテストコード

**ステップ**:

1. 最も単純なケースから開始
2. Given-When-Then/Arrange-Act-Assert 構造で記述
3. テスト実行、失敗を確認

### Phase 2: 最小実装（Green）

**入力**: 失敗するテスト
**出力**: テストを通す最小限のコード

**ステップ**:

1. テストを通す最もシンプルな実装
2. 完璧さより動作を優先
3. テスト実行、成功を確認

### Phase 3: リファクタリング（Refactor）

**入力**: 動作するコード
**出力**: 改善されたコード

**ステップ**:

1. 重複の排除
2. 命名の改善
3. 抽象化の導入
4. テスト実行、成功を維持

### Phase 4: 反復

**ステップ**:

1. 次のテストケースを選択
2. Phase 1 に戻る
3. すべてのケースが完了するまで繰り返し

---

## 判断基準チェックリスト

### TDD サイクル準拠

- [ ] テストは実装前に書かれているか？
- [ ] 各テストは一つの振る舞いのみを検証しているか？
- [ ] テストは最初に失敗し、その後成功したか？
- [ ] リファクタリング後もテストは成功するか？

### テスト品質

- [ ] テストは高速に実行されるか？（<100ms/test）
- [ ] テストは独立して実行可能か？
- [ ] テスト名から検証内容が明確か？
- [ ] テストはシンプルで理解しやすいか？

### 設計品質

- [ ] コードはテスト可能な設計になっているか？
- [ ] 依存性注入が適用されているか？
- [ ] 単一責任原則に準拠しているか？

---

## 関連スキル

| スキル名                    | パス                                              | 関係性                            |
| --------------------------- | ------------------------------------------------- | --------------------------------- |
| **test-doubles**            | `.claude/skills/test-doubles/SKILL.md`            | TDD で使用するモック/スタブの詳細 |
| **test-naming-conventions** | `.claude/skills/test-naming-conventions/SKILL.md` | テストの命名規約                  |
| **boundary-value-analysis** | `.claude/skills/boundary-value-analysis/SKILL.md` | テストケース設計手法              |
| **vitest-advanced**         | `.claude/skills/vitest-advanced/SKILL.md`         | Vitest 固有の実装パターン         |
| **refactoring-techniques**  | `.claude/skills/refactoring-techniques/SKILL.md`  | リファクタリング手法              |

---

## 参考文献

- Kent Beck『テスト駆動開発』(Test Driven Development: By Example)
- Kent Beck『エクストリームプログラミング』(Extreme Programming Explained)
- Michael Feathers『Working Effectively with Legacy Code』

---

## 使用上の注意

### このスキルが得意なこと

- Red-Green-Refactor サイクルの実践ガイダンス
- テストファースト開発の原則と手法
- レガシーコードへのテスト追加戦略
- TDD サイクルの妥当性検証

### このスキルが行わないこと

- 具体的なテストコードの実装（→ vitest-advanced）
- テストダブルの詳細な使い方（→ test-doubles）
- 境界値分析の詳細（→ boundary-value-analysis）
- E2E/統合テストの設計

---

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-26 | 初版リリース |
