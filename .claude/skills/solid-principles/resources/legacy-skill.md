---
name: .claude/skills/solid-principles/SKILL.md
description: |
  ロバート・C・マーティンが体系化したSOLID原則（SRP, OCP, LSP, ISP, DIP）の

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/solid-principles/resources/dependency-inversion.md`: Dependency Inversionリソース
  - `.claude/skills/solid-principles/resources/interface-segregation.md`: Interface Segregationリソース
  - `.claude/skills/solid-principles/resources/liskov-substitution.md`: Liskov Substitutionリソース
  - `.claude/skills/solid-principles/resources/open-closed.md`: Open Closedリソース
  - `.claude/skills/solid-principles/resources/single-responsibility.md`: Single Responsibilityリソース

  - `.claude/skills/solid-principles/templates/solid-review-checklist.md`: Solid Review Checklistテンプレート

  - `.claude/skills/solid-principles/scripts/check-solid-violations.mjs`: Check Solid Violationsスクリプト

version: 1.0.0
---

# SOLID Principles

## 概要

このスキルは、ロバート・C・マーティンが体系化した SOLID 原則に基づき、
オブジェクト指向設計の品質を評価・改善するための知識を提供します。

**核心概念**:
SOLID 原則は、変更に強く、再利用可能で、理解しやすいソフトウェアを構築するための指針。
これらの原則に従うことで、技術的負債を抑制し、長期的な保守性を確保できる。

**主要な価値**:

- 変更の影響範囲を局所化
- コードの再利用性向上
- テスト容易性の確保
- 理解しやすい設計

**対象ユーザー**:

- アーキテクチャレビューを行う.claude/agents/arch-police.md
- コード品質を管理する開発者
- リファクタリングを計画するチーム

## リソース構造

```
solid-principles/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── srp-details.md                          # 単一責任の原則詳細
│   ├── ocp-details.md                          # 開放閉鎖の原則詳細
│   ├── lsp-details.md                          # リスコフ置換の原則詳細
│   ├── isp-details.md                          # インターフェース分離詳細
│   └── dip-details.md                          # 依存性逆転の原則詳細
├── scripts/
│   └── check-solid-violations.mjs              # SOLID違反検出スクリプト
└── templates/
    └── solid-review-checklist.md               # レビューチェックリスト
```

## コマンドリファレンス

### リソース読み取り

```bash
# 単一責任の原則（SRP）詳細
cat .claude/skills/solid-principles/resources/srp-details.md

# 開放閉鎖の原則（OCP）詳細
cat .claude/skills/solid-principles/resources/ocp-details.md

# リスコフ置換の原則（LSP）詳細
cat .claude/skills/solid-principles/resources/lsp-details.md

# インターフェース分離の原則（ISP）詳細
cat .claude/skills/solid-principles/resources/isp-details.md

# 依存性逆転の原則（DIP）詳細
cat .claude/skills/solid-principles/resources/dip-details.md
```

### スクリプト実行

```bash
# SOLID違反検出スクリプト
node .claude/skills/solid-principles/scripts/check-solid-violations.mjs src/

# 特定原則のチェック
node .claude/skills/solid-principles/scripts/check-solid-violations.mjs src/ --principle=SRP
```

## 5 つの原則

### 1. 単一責任の原則 (Single Responsibility Principle)

**定義**: クラスを変更する理由は 1 つだけであるべき

**解釈**:

- 「責任」= 「変更する理由」
- 1 つのクラスは 1 つのアクターに対してのみ責任を持つ
- 複数のアクターが依存するクラスは分割が必要

**違反の兆候**:

- [ ] クラス名に「And」「Manager」「Handler」が含まれる
- [ ] メソッドが複数の異なる関心事を扱う
- [ ] 変更時に複数の理由が考えられる
- [ ] クラスの説明に「〜と〜を行う」が含まれる

**チェック方法**:

```bash
# 大きすぎるクラスを検出（行数）
wc -l src/**/*.ts | sort -n | tail -20

# 複数の責務を示唆するパターン
grep -r "class.*Manager\|class.*Handler\|class.*Service" src/
```

**是正方針**:

1. 責務を列挙
2. アクターごとに分類
3. 責務ごとにクラスを分割
4. ファサードで統合（必要に応じて）

### 2. 開放閉鎖の原則 (Open-Closed Principle)

**定義**: ソフトウェアエンティティは拡張に対して開かれ、修正に対して閉じているべき

**解釈**:

- 新機能追加時に既存コードを修正しない
- 抽象化と多態性で拡張性を確保
- if/switch 文の連鎖は違反の兆候

**違反の兆候**:

- [ ] 新しいケース追加時に既存の switch 文を修正
- [ ] 型による分岐が多数存在
- [ ] 新機能追加時に複数ファイルを修正

**チェック方法**:

```bash
# switch文の検出
grep -rn "switch\s*(" src/

# if-else連鎖の検出
grep -rn "else if\|} else {" src/
```

**是正方針**:

1. 変更されやすい部分を特定
2. 抽象化（インターフェース）を導入
3. Strategy パターン等で多態性を活用
4. 新しい振る舞いは新しいクラスで実装

### 3. リスコフ置換の原則 (Liskov Substitution Principle)

**定義**: 派生型はその基底型と置換可能でなければならない

**解釈**:

- サブクラスは親クラスの契約を守る
- 事前条件を強化してはならない
- 事後条件を弱化してはならない
- 不変条件を維持する

**違反の兆候**:

- [ ] サブクラスで例外をスローするオーバーライドメソッド
- [ ] 親クラスのメソッドを空実装でオーバーライド
- [ ] instanceof/typeof による型チェックが必要
- [ ] サブクラスで親の振る舞いを無効化

**チェック方法**:

```bash
# 型チェックの検出
grep -rn "instanceof\|typeof" src/

# 空のオーバーライドメソッド
grep -rn "override.*{\s*}\|override.*{.*return.*}" src/
```

**是正方針**:

1. 継承関係を見直し
2. 「is-a」関係が成り立つか確認
3. 継承より合成を検討
4. インターフェース分離で契約を明確化

### 4. インターフェース分離の原則 (Interface Segregation Principle)

**定義**: クライアントは使用しないインターフェースに依存することを強制されるべきではない

**解釈**:

- 大きなインターフェースは小さく分割
- クライアント固有のインターフェースを提供
- 肥大化したインターフェースは変更の影響を拡大

**違反の兆候**:

- [ ] インターフェースに 10 以上のメソッドがある
- [ ] 実装クラスで使わないメソッドがある
- [ ] 空実装や NotImplementedException が存在

**チェック方法**:

```bash
# 大きなインターフェースを検出
grep -A 50 "interface\s" src/**/*.ts | grep -c "^\s*\w\+("

# NotImplemented例外の検出
grep -rn "NotImplemented\|throw.*not.*implemented" src/
```

**是正方針**:

1. インターフェースの使用パターンを分析
2. クライアントごとに必要なメソッドを特定
3. 役割ベースでインターフェースを分割
4. 合成でインターフェースを組み合わせ

### 5. 依存性逆転の原則 (Dependency Inversion Principle)

**定義**:

- 上位モジュールは下位モジュールに依存してはならない。両者は抽象に依存すべき
- 抽象は詳細に依存してはならない。詳細が抽象に依存すべき

**解釈**:

- 具象クラスへの直接依存を避ける
- インターフェース（抽象）を介して依存
- 依存性注入で具象を外部から提供

**違反の兆候**:

- [ ] `new ConcreteClass()`が多用されている
- [ ] 上位モジュールが下位の具象クラスを import
- [ ] テスト時にモックが困難

**チェック方法**:

```bash
# new演算子による直接インスタンス化
grep -rn "new\s\+[A-Z]" src/

# 具象クラスへの直接依存
grep -rn "import.*Impl\|import.*Concrete" src/
```

**是正方針**:

1. 依存先をインターフェースに変更
2. Factory パターンでインスタンス生成を隔離
3. DI コンテナの導入を検討
4. インターフェースをドメイン層に配置

## ワークフロー

### Phase 1: 責務の分析（SRP）

**目的**: クラスの責務が単一かを確認

**ステップ**:

1. クラス/モジュールの責務を列挙
2. 変更理由（アクター）を特定
3. 複数の責務がある場合は分割を検討

**判断基準**:

- [ ] 責務が 1 文で表現できるか？
- [ ] 変更理由が 1 つだけか？
- [ ] 関連するメソッドがすべて同じ責務に属するか？

### Phase 2: 拡張性の評価（OCP）

**目的**: 拡張時に既存コードの修正が不要かを確認

**ステップ**:

1. 過去の変更履歴を分析
2. 将来予想される変更を列挙
3. 抽象化ポイントを特定

**判断基準**:

- [ ] 新機能追加時に既存コードを修正する必要がないか？
- [ ] 適切な抽象化が行われているか？
- [ ] 多態性が活用されているか？

### Phase 3: 継承関係の検証（LSP）

**目的**: サブタイプが基底型と置換可能かを確認

**ステップ**:

1. 継承関係を抽出
2. 契約（事前・事後条件）を確認
3. 置換可能性を検証

**判断基準**:

- [ ] サブクラスが親の契約を守っているか？
- [ ] 型チェックなしで置換可能か？
- [ ] 不変条件が維持されているか？

### Phase 4: インターフェースの評価（ISP）

**目的**: インターフェースが適切に分割されているかを確認

**ステップ**:

1. インターフェースのメソッド数を確認
2. 使用パターンを分析
3. 未使用メソッドを特定

**判断基準**:

- [ ] インターフェースが肥大化していないか？
- [ ] 実装クラスが全メソッドを使用しているか？
- [ ] クライアント固有の小さなインターフェースに分割できるか？

### Phase 5: 依存関係の検証（DIP）

**目的**: 抽象への依存が実現されているかを確認

**ステップ**:

1. 依存関係を可視化
2. 具象依存を特定
3. 抽象化を提案

**判断基準**:

- [ ] 上位モジュールが抽象に依存しているか？
- [ ] 具象クラスへの直接依存がないか？
- [ ] 依存性注入が適用されているか？

## ベストプラクティス

### すべきこと

1. **設計時に原則を意識**:
   - 新規クラス作成時に SRP を確認
   - 継承前に LSP を検討
   - 依存関係を DIP で設計

2. **定期的なレビュー**:
   - コードレビューで SOLID 違反を指摘
   - 定期的なアーキテクチャ監査

3. **段階的な改善**:
   - 最も影響の大きい違反から修正
   - リファクタリングはテストで保護

### 避けるべきこと

1. **過度な抽象化**:
   - ❌ 1 クラスに 1 インターフェースを強制
   - ✅ 必要な箇所に適切な抽象化

2. **原則の教条的適用**:
   - ❌ すべてのコードに SOLID を強制
   - ✅ トレードオフを考慮した適用

## トラブルシューティング

### 問題 1: God Class（SRP 違反）

**症状**: 数千行のクラス、多数の責務

**解決策**:

1. 責務を列挙
2. 関連するメソッドをグループ化
3. グループごとにクラスを抽出
4. ファサードで統合（必要に応じて）

### 問題 2: 継承の乱用（LSP 違反）

**症状**: 深い継承階層、型チェックの多用

**解決策**:

1. 継承を合成に置き換え
2. インターフェースで振る舞いを定義
3. Strategy パターンの適用

### 問題 3: 密結合（DIP 違反）

**症状**: テストが困難、変更の波及が大きい

**解決策**:

1. インターフェースの導入
2. 依存性注入の適用
3. Factory パターンの活用

## 関連スキル

- **.claude/skills/clean-architecture-principles/SKILL.md** (`.claude/skills/clean-architecture-principles/SKILL.md`): レイヤー分離
- **.claude/skills/code-smell-detection/SKILL.md** (`.claude/skills/code-smell-detection/SKILL.md`): 違反の検出
- **.claude/skills/dependency-analysis/SKILL.md** (`.claude/skills/dependency-analysis/SKILL.md`): 依存関係分析

## メトリクス

### SOLID 準拠スコア

**評価基準（各原則 0-20 点、計 100 点）**:

- SRP: クラスあたりの責務数
- OCP: 拡張時の既存コード変更量
- LSP: 型チェックの使用頻度
- ISP: インターフェースあたりのメソッド数
- DIP: 抽象依存率

**目標**: 80 点以上

## 変更履歴

| バージョン | 日付       | 変更内容                      |
| ---------- | ---------- | ----------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - SOLID 原則の体系化 |

## 参考文献

- **『アジャイルソフトウェア開発の奥義』** Robert C. Martin 著
  - Chapter 7-12: SOLID 原則の詳細
- **『Clean Architecture』** Robert C. Martin 著
  - Part III: Design Principles
