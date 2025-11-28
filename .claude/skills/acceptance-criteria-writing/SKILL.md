---
name: acceptance-criteria-writing
description: |
  Given-When-Then形式によるテスト可能な受け入れ基準の定義スキル。
  要件の完了条件を明確化し、自動テストへの変換を可能にします。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/acceptance-criteria-writing/resources/edge-case-patterns.md`: エッジケースパターン集
  - `.claude/skills/acceptance-criteria-writing/resources/gwt-patterns.md`: Given-When-Thenパターン集
  - `.claude/skills/acceptance-criteria-writing/resources/testability-guide.md`: 曖昧な基準を測定可能で検証可能な形に変換する4つの特性（具体性・測定可能性・観測可能性・再現可能性）の実践ガイド
  - `.claude/skills/acceptance-criteria-writing/templates/acceptance-criteria-template.md`: 受け入れ基準テンプレート
  - `.claude/skills/acceptance-criteria-writing/scripts/validate-acceptance-criteria.mjs`: 受け入れ基準検証スクリプト

  専門分野:
  - Given-When-Then形式: BDD（振る舞い駆動開発）スタイルの基準記述
  - シナリオ設計: 正常系・異常系・境界値の網羅的カバレッジ
  - テスト変換: 受け入れ基準から自動テストへの直接変換
  - 検証可能性: 測定可能で判定可能な条件定義

  使用タイミング:
  - 機能要件の完了条件を定義する時
  - ユーザーストーリーに受け入れ基準を追加する時
  - テストケースの基盤を作成する時
  - 実装完了の判定基準を明確化する時

  Use proactively when users need to define acceptance criteria, create testable conditions,
  or establish completion criteria for features.
version: 1.0.0
---

# Acceptance Criteria Writing

## 概要

このスキルは、Given-When-Then形式によるテスト可能な受け入れ基準の定義方法を提供します。
明確な完了条件を定義することで、実装者・テスター・ステークホルダー間の認識を統一し、
自動テストへの直接変換を可能にします。

**核心概念**:
- **Given-When-Then**: 前提条件→アクション→期待結果の構造化
- **テスト可能性**: 自動テストに直接変換可能な記述
- **網羅性**: 正常系・異常系・境界値の完全カバレッジ
- **独立性**: 各シナリオが独立してテスト可能

**主要な価値**:
- 実装完了の明確な判定基準
- テストケースへの直接変換
- ステークホルダー間の認識統一

## リソース構造

```
acceptance-criteria-writing/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── given-when-then-patterns.md             # GWT形式のパターン集
│   ├── scenario-types.md                       # シナリオタイプ別ガイド
│   ├── boundary-value-analysis.md              # 境界値分析手法
│   └── anti-patterns.md                        # アンチパターンと回避策
├── scripts/
│   └── validate-criteria.mjs                   # 受け入れ基準検証スクリプト
└── templates/
    └── acceptance-criteria-template.md         # 受け入れ基準テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Given-When-Thenパターン
cat .claude/skills/acceptance-criteria-writing/resources/given-when-then-patterns.md

# シナリオタイプガイド
cat .claude/skills/acceptance-criteria-writing/resources/scenario-types.md

# 境界値分析
cat .claude/skills/acceptance-criteria-writing/resources/boundary-value-analysis.md

# アンチパターン
cat .claude/skills/acceptance-criteria-writing/resources/anti-patterns.md
```

### テンプレート参照

```bash
# 受け入れ基準テンプレート
cat .claude/skills/acceptance-criteria-writing/templates/acceptance-criteria-template.md
```

## いつ使うか

### シナリオ1: 機能要件への基準追加
**状況**: 機能要件に完了条件を追加する

**適用条件**:
- [ ] 機能要件が定義されている
- [ ] 完了の判定基準が曖昧
- [ ] テスト可能な条件が必要

**期待される成果**: Given-When-Then形式の受け入れ基準

### シナリオ2: ユーザーストーリーの詳細化
**状況**: ユーザーストーリーにテスト条件を追加

**適用条件**:
- [ ] ユーザーストーリーが存在
- [ ] 「何をもって完了とするか」が不明確
- [ ] 開発者とQAの認識を統一したい

**期待される成果**: 複数シナリオを含む受け入れ基準

### シナリオ3: テストケースの基盤作成
**状況**: 自動テストの設計に使用可能な基準を作成

**適用条件**:
- [ ] テスト自動化を計画
- [ ] テストケースの設計が必要
- [ ] 網羅性の確保が重要

**期待される成果**: テストコードに直接変換可能な基準

## ワークフロー

### Phase 1: シナリオの洗い出し

**目的**: 必要なシナリオを網羅的に特定

**ステップ**:
1. 正常系シナリオ（ハッピーパス）
2. 異常系シナリオ（エラーケース）
3. 境界値シナリオ
4. エッジケース

**判断基準**:
- [ ] 正常系が網羅されているか？
- [ ] 異常系が考慮されているか？
- [ ] 境界値が特定されているか？

**リソース**: `resources/scenario-types.md`

### Phase 2: Given-When-Then記述

**目的**: 各シナリオを構造化された形式で記述

**ステップ**:
1. **Given（前提条件）**:
   - システムの初期状態
   - ユーザーの状態
   - データの状態
2. **When（アクション）**:
   - ユーザーが実行する操作
   - システムが受け取るイベント
3. **Then（期待結果）**:
   - 期待されるシステムの応答
   - 期待される状態変化
   - 期待される出力

**判断基準**:
- [ ] Givenが具体的な状態を定義しているか？
- [ ] Whenが明確なアクションか？
- [ ] Thenが検証可能な結果か？

**リソース**: `resources/given-when-then-patterns.md`

### Phase 3: 境界値の特定

**目的**: 境界条件を特定し、シナリオに追加

**ステップ**:
1. 入力値の境界特定
   - 最小値、最大値
   - 空、NULL
   - 形式の境界（長さ、型）
2. 境界値シナリオの作成
3. 異常値シナリオの追加

**判断基準**:
- [ ] すべての境界値が特定されているか？
- [ ] 境界値テストが含まれているか？

**リソース**: `resources/boundary-value-analysis.md`

### Phase 4: 品質検証

**目的**: 受け入れ基準の品質を検証

**ステップ**:
1. 独立性の確認（各シナリオが独立）
2. 具体性の確認（曖昧な表現がない）
3. テスト可能性の確認
4. 網羅性の確認

**判断基準**:
- [ ] 各シナリオが独立してテスト可能か？
- [ ] 期待される結果が具体的で測定可能か？
- [ ] すべてのケースがカバーされているか？

## Given-When-Then形式

```markdown
## 受け入れ基準: [機能名]

### シナリオ1: [正常系の名前]
- **Given**: [前提条件]
  - [具体的な初期状態]
- **When**: [実行するアクション]
  - [ユーザーの操作]
- **Then**: [期待される結果]
  - [具体的で検証可能な結果]

### シナリオ2: [異常系の名前]
- **Given**: [前提条件]
- **When**: [エラーを引き起こすアクション]
- **Then**: [期待されるエラー処理]

### シナリオ3: [境界値の名前]
- **Given**: [境界条件の前提]
- **When**: [境界値でのアクション]
- **Then**: [期待される動作]
```

## シナリオタイプ別チェックリスト

### 正常系（Happy Path）
- [ ] 期待通りの入力でのシナリオ
- [ ] 成功時の結果が明確

### 異常系（Error Cases）
- [ ] 無効な入力でのシナリオ
- [ ] エラーメッセージが明確
- [ ] エラー時の状態が定義

### 境界値（Boundary Values）
- [ ] 最小値でのシナリオ
- [ ] 最大値でのシナリオ
- [ ] 境界±1のシナリオ

### エッジケース
- [ ] 空・NULL値でのシナリオ
- [ ] 同時実行のシナリオ
- [ ] タイムアウトのシナリオ

## ベストプラクティス

### すべきこと

1. **具体的な値を使用**:
   - ✅ 「100文字の入力」
   - ❌ 「長い入力」

2. **検証可能な結果**:
   - ✅ 「HTTPステータス200を返す」
   - ❌ 「成功する」

3. **独立したシナリオ**:
   - 各シナリオが単独でテスト可能

### 避けるべきこと

1. **曖昧な表現**:
   - ❌ 「適切なエラーを表示」
   - ✅ 「"入力が無効です"というエラーメッセージを表示」

2. **複合シナリオ**:
   - ❌ 複数のWhenを含む
   - ✅ 1シナリオ1アクション

3. **実装詳細**:
   - ❌ 「SQLクエリを実行」
   - ✅ 「データが保存される」

## プロジェクト固有の適用

### TDD準拠の受け入れ基準

**このプロジェクトではTDD（Test-Driven Development）が必須**:

**受け入れ基準 → テストコード変換の例**:
```
受け入れ基準（Given-When-Then）:
---
Given: ユーザーが有効なYouTube URLを入力
When: /summarize コマンドを実行
Then:
- 動画の要約が返される
- 応答時間が30秒以内
- 要約文字数が500-1000字

↓ 直接変換 ↓

Vitestテストコード（features/youtube-summarize/__tests__/executor.test.ts）:
---
describe('YouTubeSummarizeExecutor', () => {
  it('should return summary when valid URL', async () => {
    // Given
    const input = { url: 'https://youtube.com/watch?v=xxx' };

    // When
    const result = await executor.execute(input, context);

    // Then
    expect(result.summary).toBeDefined();
    expect(result.summary.length).toBeGreaterThanOrEqual(500);
    expect(result.summary.length).toBeLessThanOrEqual(1000);
  });
});
```

### ハイブリッドアーキテクチャの反映

**features/ 垂直スライスに対応した基準**:
```
機能: YouTube動画要約
配置: features/youtube-summarize/

受け入れ基準:
- [ ] schema.ts で Zod バリデーションが定義されている
- [ ] executor.ts で IWorkflowExecutor を実装している
- [ ] shared/infrastructure/ai/ から AI クライアントを取得している
- [ ] __tests__/executor.test.ts でカバレッジ60%以上を達成している
- [ ] features/registry.ts に1行登録で有効化される
```

### 技術スタック制約の反映

**Zod + TypeScript strict による型安全性**:
```
受け入れ基準に含めるべき項目:
- [ ] 入力スキーマが Zod で定義されている（inputSchema）
- [ ] 出力スキーマが Zod で定義されている（outputSchema）
- [ ] TypeScript strict mode でコンパイルエラーがゼロ
- [ ] any 型の使用がゼロ（unknown または具体的な型を使用）
```

**Vitest によるテスト要件**:
```
受け入れ基準に含めるべきテスト条件:
- [ ] 正常系テスト（Happy Path）が存在
- [ ] 異常系テスト（エラーケース）が存在
- [ ] 境界値テスト（最小値・最大値・境界±1）が存在
- [ ] モックによる外部依存の分離（AI API、DB、Discord）
- [ ] カバレッジ60%以上を達成
```

**Railway デプロイメント制約**:
```
非機能要件に含めるべき項目:
- [ ] 環境変数による設定（DATABASE_URL、AI API キー等）
- [ ] 一時ファイルは /tmp ディレクトリに保存（再デプロイで削除）
- [ ] 長時間処理（>30秒）の場合は非同期処理
- [ ] ログは構造化JSON形式（Railway Logs互換）
```

## 関連スキル

- **requirements-engineering** (`.claude/skills/requirements-engineering/SKILL.md`): 要件工学
- **use-case-modeling** (`.claude/skills/use-case-modeling/SKILL.md`): ユースケース
- **functional-non-functional-requirements** (`.claude/skills/functional-non-functional-requirements/SKILL.md`): 要件分類
- **tdd-principles** (`.claude/skills/tdd-principles/SKILL.md`): TDD実践、Red-Green-Refactor

## メトリクス

### シナリオ網羅性
**測定方法**: (カバーされたシナリオ / 必要なシナリオ) × 100
**目標**: >95%

### テスト変換率
**測定方法**: (テストに変換された基準 / 総基準) × 100
**目標**: 100%

### 品質スコア
- 具体性 (0-10)
- 独立性 (0-10)
- 検証可能性 (0-10)
- 網羅性 (0-10)
**目標**: 平均8点以上

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 |

## 参考文献

- **『Specification by Example』** Gojko Adzic著
- **『BDD in Action』** John Ferguson Smart著
- **『The Cucumber Book』** Matt Wynne, Aslak Hellesoy著
