---
name: .claude/skills/progressive-disclosure/SKILL.md
description: |
  3層開示モデルによるトークン効率と知識スケーラビリティの両立を専門とするスキル。
  メタデータ→本文→リソースの段階的な情報提供により、必要な時に必要な知識だけを
  ロードし、スキル発動信頼性を最大化します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/progressive-disclosure/resources/commitment-mechanism.md`: コミットメントメカニズム設計ガイド
  - `.claude/skills/progressive-disclosure/resources/metadata-design.md`: メタデータ設計ガイド
  - `.claude/skills/progressive-disclosure/resources/skill-activation-optimization.md`: スキル発動最適化ガイド
  - `.claude/skills/progressive-disclosure/resources/three-layer-model.md`: 3層開示モデル詳細ガイド
  - `.claude/skills/progressive-disclosure/resources/token-efficiency-strategies.md`: 遅延読み込み、インデックス駆動設計によるトークン使用量60-80%削減手法
  - `.claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs`: Token Usage Calculator for Claude Code Skills
  - `.claude/skills/progressive-disclosure/scripts/calculate-token-usage.sh`: File Size Checker for Claude Code Skills
  - `.claude/skills/progressive-disclosure/templates/skill-metadata-template.yaml`: skill-metadata-template設定ファイル

  専門分野:
  - 3層開示モデル: メタデータ層、本文層、リソース層の設計原則
  - トークン効率化: 段階的ロード、遅延読み込み、コンテキスト最小化
  - スキル発動最適化: トリガー設計、コミットメントメカニズム、発動率向上
  - メタデータ設計: description最適化、キーワード設計、自動起動条件

  使用タイミング:
  - スキルのYAML Frontmatter（特にdescription）を設計する時
  - トークン使用量を最小化する必要がある時
  - スキルの自動発動率を向上させる時
  - 大量の知識を効率的に提供する必要がある時

  Use proactively when designing skill metadata, optimizing token usage,
  or improving skill activation reliability.
version: 1.0.0
---

# Progressive Disclosure

## 概要

Progressive Disclosure（段階的開示）は、情報を一度にすべて提示するのではなく、
ユーザーのニーズに応じて段階的に提供する設計原則です。

Claude Codeスキルシステムにおいては、3層構造（メタデータ→本文→リソース）により、
トークン効率と知識の深さを両立させ、スキルの自動発動信頼性を最大化します。

**主要な価値**:

- トークン使用量を60-80%削減
- スキル発動率を20%から84%に向上
- 必要な時に必要な情報だけを提供
- コンテキスト汚染を防止

**対象ユーザー**:

- スキルを設計するエージェント（.claude/agents/skill-librarian.md）
- スキルメタデータを最適化したい開発者
- トークン効率を重視するプロジェクト

## リソース構造

```
progressive-disclosure/
├── SKILL.md                                    # 本ファイル（概要と設計原則）
├── resources/
│   ├── three-layer-model.md                   # 3層開示モデルの詳細設計
│   ├── metadata-design.md                     # メタデータ層の最適化手法
│   ├── skill-activation-optimization.md       # スキル発動率向上戦略
│   ├── token-efficiency-strategies.md         # トークン効率化の具体的手法
│   └── commitment-mechanism.md                # コミットメントメカニズム設計
├── scripts/
│   └── calculate-token-usage.sh               # トークン使用量計算スクリプト
└── templates/
    └── skill-metadata-template.yaml           # スキルメタデータテンプレート
```

### リソース種別

- **3層モデル** (`resources/three-layer-model.md`): メタデータ・本文・リソース層の設計原則
- **メタデータ最適化** (`resources/metadata-design.md`): description設計、キーワード選定
- **発動最適化** (`resources/skill-activation-optimization.md`): 発動率向上の戦略（20%→84%）
- **トークン効率** (`resources/token-efficiency-strategies.md`): 遅延読み込み、インデックス設計
- **コミットメントメカニズム** (`resources/commitment-mechanism.md`): 評価→約束→実行の3段階プロセス
- **計算スクリプト** (`scripts/calculate-token-usage.mjs`): トークン見積もりの自動化（TypeScript）
- **テンプレート** (`templates/skill-metadata-template.yaml`): スキルYAML Frontmatterの標準フォーマット

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# 3層開示モデル詳細
cat .claude/skills/progressive-disclosure/resources/three-layer-model.md

# メタデータ設計ガイド
cat .claude/skills/progressive-disclosure/resources/metadata-design.md

# スキル発動最適化戦略
cat .claude/skills/progressive-disclosure/resources/skill-activation-optimization.md

# トークン効率化戦略
cat .claude/skills/progressive-disclosure/resources/token-efficiency-strategies.md

# コミットメントメカニズム
cat .claude/skills/progressive-disclosure/resources/commitment-mechanism.md
```

### スクリプト実行

```bash
# スキルディレクトリのトークン使用量計算（TypeScript）
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs <skill-directory>

# 例: progressive-disclosureスキル自体を分析
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs .claude/skills/progressive-disclosure

# 例: knowledge-managementスキルを分析
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs .claude/skills/knowledge-management
```

### テンプレート参照

```bash
# スキルメタデータテンプレートを読み取る
cat .claude/skills/progressive-disclosure/templates/skill-metadata-template.yaml

# 新しいスキルにテンプレートを適用
cp .claude/skills/progressive-disclosure/templates/skill-metadata-template.yaml ./new-skill/SKILL.md
```

## いつ使うか

### シナリオ1: スキルメタデータの設計

**状況**: 新しいスキルのYAML Frontmatterを作成する

**適用条件**:

- [ ] スキルのdescriptionを設計する必要がある
- [ ] 自動発動のトリガー条件を定義したい
- [ ] トークン効率を最大化したい

**期待される成果**: 発動率の高い、効率的なメタデータ

### シナリオ2: トークン使用量の削減

**状況**: スキルのトークン使用量が大きすぎる

**適用条件**:

- [ ] スキル全体のトークン使用量が20K以上
- [ ] SKILL.md本文が500行を超えそう
- [ ] コンテキスト汚染を防ぎたい

**期待される成果**: 60-80%のトークン削減

### シナリオ3: スキル発動率の向上

**状況**: スキルが自動発動しない

**適用条件**:

- [ ] スキルの発動率が50%未満
- [ ] トリガー条件が不明確
- [ ] エージェントがスキルを見逃している

**期待される成果**: 発動率を84%以上に向上

## 前提条件

### 必要な知識

- [ ] Claude Codeスキルシステムの基本理解
- [ ] YAML Frontmatterの基本文法
- [ ] トークンとコンテキストウィンドウの概念

### 必要なツール

- Read: 既存スキルの分析
- Write: SKILL.mdとリソースの作成
- Grep: パターン検索

### 環境要件

- `.claude/skills/`ディレクトリが存在する
- 参照する既存スキルが利用可能

## ワークフロー

### Phase 1: 3層構造の設計

**目的**: メタデータ・本文・リソースの3層に情報を適切に配置する

**ステップ**:

1. **情報の分類**:
   - レベル1向け: 概要、トリガー条件（常時ロード）
   - レベル2向け: ワークフロー、基本的なベストプラクティス（必要時ロード）
   - レベル3向け: 詳細な専門知識（参照時ロード）

2. **各層の設計**:
   - メタデータ層: name + description（約100トークン）
   - 本文層: SKILL.md（<500行、約3,000トークン）
   - リソース層: 複数ファイル（各<500行）

3. **参照フローの定義**:
   - SKILL.mdから各リソースへの明確なポインタ
   - リソース間の相互参照
   - 段階的なナビゲーション

**判断基準**:

- [ ] 各層の役割が明確か？
- [ ] 情報の配置が適切か？
- [ ] 参照フローが論理的か？

**リソース**: `resources/three-layer-model.md`

### Phase 2: メタデータの最適化

**目的**: descriptionを設計し、自動発動率を最大化する

**ステップ**:

1. **description構成要素の定義**:
   - 概要（1-2文）
   - 専門分野（2-4項目）
   - 使用タイミング（3-6項目）
   - プロアクティブ指示（オプション）

2. **トリガーキーワードの選定**:
   - 技術名の明示
   - 操作・概念の具体化
   - ユースケースの列挙

3. **除外条件の定義**:
   - 使用すべきでない状況の明示
   - 他スキルとの境界明確化

**判断基準**:

- [ ] トリガーキーワードが3つ以上あるか？
- [ ] 具体的な使用シナリオが含まれているか？
- [ ] 除外条件が明示されているか？

**リソース**: `resources/metadata-design.md`

### Phase 3: トークン効率の最大化

**目的**: 必要最小限のトークンで最大の価値を提供する

**ステップ**:

1. **遅延読み込み設計**:
   - 全リソースの事前ロード禁止
   - 必要なリソースのみ参照
   - エージェントが判断して選択

2. **インデックス駆動設計**:
   - SKILL.mdは目次として機能
   - 各リソースへの明確なポインタ
   - 参照タイミングのガイダンス

3. **圧縮と精錬**:
   - 冗長性の排除
   - 本質的情報のみ抽出
   - 例は最小限（2-3個）

**判断基準**:

- [ ] SKILL.mdがインデックスとして機能するか？
- [ ] トークン使用量が推奨範囲（<20K）か？
- [ ] 無駄な冗長性がないか？

**リソース**: `resources/token-efficiency-strategies.md`

### Phase 4: 発動信頼性の向上

**目的**: スキルが適切なタイミングで確実に発動するようにする

**ステップ**:

1. **トリガー設計の最適化**:
   - プライマリトリガー（必ず発動）
   - セカンダリトリガー（文脈依存）
   - 除外トリガー（発動すべきでない状況）

2. **コミットメントメカニズムの実装**:
   - 評価フェーズ: 各スキルの適合性を明示的に判断
   - 約束フェーズ: 適合すると判断したスキルを宣言
   - 実行フェーズ: 宣言したスキルを必ず有効化

3. **発動率の測定と改善**:
   - テストプロンプトセットの作成
   - 発動率の計算
   - 改善サイクルの実施

**判断基準**:

- [ ] トリガー階層が明確か？
- [ ] コミットメントメカニズムが機能するか？
- [ ] 発動率が目標値（単一責任: 90%、協調: 60%）に達するか？

**リソース**: `resources/skill-activation-optimization.md`, `resources/commitment-mechanism.md`

## リソースへの参照

詳細な知識は以下のリソースファイルを参照してください:

- **3層開示モデル詳細**: `resources/three-layer-model.md`
  - 各層の設計原則と配置基準
  - 層間の参照フロー
  - トークン削減効果の見積もり

- **メタデータ設計ガイド**: `resources/metadata-design.md`
  - description構造化パターン
  - トリガーキーワード選定手法
  - プロアクティブ指示の設計

- **スキル発動最適化**: `resources/skill-activation-optimization.md`
  - 発動率向上戦略（20%→84%）
  - 発動パターン（単一責任、階層的、協調的）
  - 測定とフィードバックループ

- **トークン効率化戦略**: `resources/token-efficiency-strategies.md`
  - 遅延読み込みパターン
  - インデックス駆動設計
  - 圧縮と精錬テクニック

- **コミットメントメカニズム**: `resources/commitment-mechanism.md`
  - 評価→約束→実行の3段階プロセス
  - 強制評価フックの実装
  - 発動信頼性の評価フレームワーク

## ベストプラクティス

### すべきこと

1. **メタデータに投資**:
   - descriptionの設計に時間をかける
   - トリガーキーワードを厳選
   - 具体的な使用シナリオを明示

2. **階層的な情報配置**:
   - 概要は簡潔に（SKILL.md）
   - 詳細は分離（リソース）
   - 参照は明確に

3. **発動率を測定**:
   - テストプロンプトで検証
   - 実測データで改善
   - 継続的な最適化

### 避けるべきこと

1. **全情報の事前ロード**:
   - ❌ すべてのリソースを一括で読み込む
   - ✅ 必要なリソースのみ段階的に読み込む

2. **曖昧なトリガー**:
   - ❌ 「適切な時に使用」
   - ✅ 「React hooksを実装する時」「データベーススキーマを設計する時」

3. **発動率の未測定**:
   - ❌ 作成して終わり
   - ✅ 実測して継続的に改善

## トラブルシューティング

### 問題1: スキルが発動しない

**症状**: 該当するタスクなのにスキルが選択されない

**原因**:

- descriptionのトリガーキーワードが不明確
- 使用タイミングが抽象的すぎる
- 他のスキルと区別できない

**解決策**:

1. descriptionに具体的な技術名・操作名を追加
2. 使用タイミングを「〇〇の時」という明確なシナリオで記述
3. 除外条件を明示して境界を明確化

**予防策**: テストプロンプトで発動率を測定

### 問題2: トークン使用量が大きい

**症状**: スキル全体で20K以上のトークンを使用

**原因**:

- すべての情報をSKILL.mdに含めている
- リソース分割が不十分
- 冗長な記述が多い

**解決策**:

1. SKILL.mdを500行以内に制限
2. 詳細情報をリソースに分離
3. 冗長性を排除（DRY原則）

**予防策**: 設計段階でトークン見積もりを実施

### 問題3: 情報が見つからない

**症状**: 必要な情報がどこにあるか分からない

**原因**:

- SKILL.mdからリソースへの参照が不明確
- リソース間の関連性が不明
- ナビゲーションが複雑

**解決策**:

1. SKILL.mdに「リソースへの参照」セクションを追加
2. 各Phaseで対応するリソースを明示
3. リソース構造セクションでディレクトリツリーを提示

**予防策**: インデックス駆動設計を徹底

## 関連スキル

- **.claude/skills/knowledge-management/SKILL.md** (`.claude/skills/knowledge-management/SKILL.md`): SECIモデル、知識の体系化
- **.claude/skills/documentation-architecture/SKILL.md** (`.claude/skills/documentation-architecture/SKILL.md`): ドキュメント構造設計
- **.claude/skills/context-optimization/SKILL.md** (`.claude/skills/context-optimization/SKILL.md`): トークン最適化の詳細手法
- **.claude/skills/best-practices-curation/SKILL.md** (`.claude/skills/best-practices-curation/SKILL.md`): ベストプラクティスの品質評価

## メトリクス

### トークン削減率

**測定方法**: (削減されたトークン数 / 元のトークン数) × 100

**目標**: 60-80%

### スキル発動率

**測定方法**: (発動した回数 / テスト総数) × 100

**目標**:

- 単一責任スキル: 90%以上
- 階層的スキル: 70-80%
- 協調的スキル: 60-70%

### 情報発見時間

**測定方法**: ユーザーが必要な情報を見つけるまでの時間

**目標**: <2分

## 変更履歴

| バージョン | 日付       | 変更内容                                                 |
| ---------- | ---------- | -------------------------------------------------------- |
| 1.0.0      | 2025-11-23 | 初版作成 - 3層開示モデルとスキル発動最適化フレームワーク |

## 使用上の注意

### このスキルが得意なこと

- スキルメタデータ（description）の設計と最適化
- トークン使用量の削減（60-80%）
- スキル発動率の向上（20%→84%）
- 3層構造の設計

### このスキルが行わないこと

- スキルの実際の実行
- コンテンツの作成（構造設計のみ）
- プロジェクト固有のビジネスロジック

### 推奨される使用フロー

1. 3層構造の設計（Phase 1）
2. メタデータの最適化（Phase 2）
3. トークン効率の最大化（Phase 3）
4. 発動信頼性の向上（Phase 4）

### 参考文献

- **『Progressive Disclosure in User Interface Design』** (Web Resource)
  - 情報の段階的開示テクニック
  - 認知負荷の軽減方法

- **『Don't Make Me Think』** Steve Krug著
  - ユーザビリティの原則
  - 情報設計の基本
