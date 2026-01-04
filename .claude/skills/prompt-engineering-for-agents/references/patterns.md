# System Promptパターン集

## 概要

エージェントのSystem Prompt設計における効果的なパターン集です。
実践的な7つの主要パターンと、それぞれの適用方法を解説します。

## System Promptの構造

### 推奨7セクション構造

```markdown
# {{エージェント名}}

## 役割

{{役割の説明}}

## 専門分野

{{専門領域のリスト}}

## ワークフロー

{{Phase 1-Nの詳細}}

## スキル管理

{{使用タイミングと依存スキル}}

## ベストプラクティス

{{すべきこと・避けるべきこと}}

## 詳細リファレンス

{{リソース・テンプレート・スクリプトへの参照}}

## 変更履歴

{{バージョン履歴}}
```

## パターン1: Role Prompting

### 概要

エージェントに明確な役割とペルソナを与えるパターン。
専門性を高め、一貫した判断基準を確立します。

### 基本形式

```markdown
## 役割

あなたは **{{役割名}}** です。

{{役割の詳細説明}}
```

### 効果

- ✅ エージェントの行動指針が明確になる
- ✅ 一貫した判断基準が形成される
- ✅ 専門性が向上する
- ✅ 文脈理解が深まる

### 実装例

#### 例1: リファクタリング専門家

```markdown
## 役割

あなたは **リファクタリング専門家** です。

マーティン・ファウラー『リファクタリング』に基づき、
コードの匂いを検出し、適切なリファクタリング手法を
選択・適用することで、コード品質を体系的に改善します。

**専門分野**:

- Code Smells検出（Long Method、Large Class、Duplicate Code）
- リファクタリングパターン選択（Extract Method、Extract Class）
- テスト駆動リファクタリング（Red-Green-Refactor）
```

#### 例2: セキュリティ監査人

```markdown
## 役割

あなたは **セキュリティ監査人** です。

OWASP Top 10とCWE分類に基づき、Webアプリケーションの
脆弱性を体系的に検出し、具体的な修正案を提示します。

**専門分野**:

- SQLインジェクション検出
- XSS脆弱性検出
- CSRF対策検証
- 認証・認可の脆弱性分析
```

### ベストプラクティス

✅ **すべきこと**:

- 役割名は1-2語で簡潔に
- 専門分野を3-5個リスト
- 参考文献・標準を明示

❌ **避けるべきこと**:

- 曖昧な役割定義（「コードを書く人」）
- 複数の役割の混在
- 専門性のない一般的な説明

## パターン2: Constrained Behavior

### 概要

制約条件を明示して、エージェントの動作を制御するパターン。
不適切な動作を防止し、品質基準を明確化します。

### 基本形式

```markdown
## ベストプラクティス

✅ **すべきこと**:

- {{制約1}}
- {{制約2}}

❌ **避けるべきこと**:

- {{禁止事項1}}
- {{禁止事項2}}
```

### 効果

- ✅ 不適切な動作を防止
- ✅ 品質基準を明確化
- ✅ エラーを減らす
- ✅ 一貫性を向上

### 実装例

```markdown
## ベストプラクティス

✅ **すべきこと**:

- 明確で説明的な変数名を使用（`getUserData` ○、`getData` ×）
- 小さなステップでリファクタリング（1コミット1変更）
- 各ステップでテストを実行（Green状態を維持）
- Extract Methodは5行以上のコードブロックに適用

❌ **避けるべきこと**:

- テストなしのリファクタリング
- 複数の変更を同時に実施（リファクタリング+機能追加）
- 曖昧な変数名の使用（`temp`, `data`, `obj`）
- 大規模な一括変更（段階的に実施）
```

### ベストプラクティス

✅ **すべきこと**:

- 具体的な基準値を設定（「5行以上」）
- 理由を添える（「Green状態を維持」）
- 代替手段を提示

❌ **避けるべきこと**:

- 曖昧な制約（「できるだけ」）
- 理由のない禁止
- 過度に厳しい制約

## パターン3: Structured Workflow

### 概要

タスクを段階的なワークフローとして構造化するパターン。
体系的な実行とツール使用の適切化を実現します。

### 基本形式

```markdown
## ワークフロー

### Phase 1: {{Phase名}}

**目的**: {{Phase目的}}

**手順**:

1. {{ステップ1}}
2. {{ステップ2}}
3. {{ステップ3}}

**ツール使用**:

- {{ツール1}}: {{使用目的}}
- {{ツール2}}: {{使用目的}}

**成果物**:

- {{成果物1}}

**判断ポイント**:

- {{判断基準1}}
```

### 効果

- ✅ タスクを体系的に実行
- ✅ ツール使用が適切になる
- ✅ 成果物が明確になる
- ✅ 進捗を追跡可能

### 実装例

```markdown
## ワークフロー

### Phase 1: Code Smellsの検出

**目的**: リファクタリング対象のコードを特定

**手順**:

1. 対象コードファイルを読み込み
2. Long Method（20行以上のメソッド）を検出
3. Duplicate Code（3箇所以上の重複）を特定
4. Large Class（10メソッド以上のクラス）を発見
5. 検出結果をレポート形式で出力

**ツール使用**:

- Read: コードファイルの読み込み
- Grep: パターン検索（重複コード検出）
- Write: レポート生成

**成果物**:

- `docs/code-smells-report.md`（検出結果レポート）
- 優先順位付きリファクタリング候補リスト

**判断ポイント**:

- Long Methodの基準: 20行以上
- Duplicate Codeの基準: 3箇所以上
- 優先度: セキュリティ影響度 > 複雑度 > 重複度

### Phase 2: リファクタリング計画

**目的**: 安全なリファクタリング手順を設計

**手順**:

1. Code Smellsを重要度順にソート
2. 各Code Smellに適切なパターンを選択
3. 依存関係を分析し、実施順を決定
4. テスト戦略を策定
5. リファクタリング計画を文書化

**ツール使用**:

- Read: 既存テストの確認
- Write: リファクタリング計画書作成

**成果物**:

- `docs/refactoring-plan.md`（実施計画）
- テストケースリスト

**判断ポイント**:

- テストカバレッジ: 80%以上を維持
- 実施順: 依存関係の少ないものから
- リスク評価: 影響範囲を事前に特定
```

### ベストプラクティス

✅ **すべきこと**:

- Phaseごとに明確な目的を設定
- 具体的な判断基準を記述
- ツールと成果物を明示

❌ **避けるべきこと**:

- 曖昧な手順（「適宜確認」）
- 判断基準のない手順
- 成果物の定義なし

## パターン4: Knowledge Reference

### 概要

外部スキルや知識リソースへの参照を明示するパターン。
プログレッシブディスクロージャーによりToken消費を最適化します。

### 基本形式

````markdown
## スキル管理

このエージェントは以下のスキルに依存しています:

- **{{スキル1}}** (`skills/{{スキル1パス}}/SKILL.md`)
- **{{スキル2}}** (`skills/{{スキル2パス}}/SKILL.md`)

🔴 起動時にこれらのスキルを必ず読み込んでください:

\```bash
cat skills/{{スキル1パス}}/SKILL.md
cat skills/{{スキル2パス}}/SKILL.md
\```
````

### 効果

- ✅ プログレッシブディスクロージャー実現
- ✅ エージェント本体の軽量化
- ✅ 専門知識の分離
- ✅ 再利用性の向上

### 実装例

````markdown
## スキル管理

このエージェントは以下のスキルに依存しています:

- **refactoring-patterns** (`skills/refactoring-patterns/SKILL.md`)
- **code-smell-detection** (`skills/code-smell-detection/SKILL.md`)
- **tdd-principles** (`skills/tdd-principles/SKILL.md`)

🔴 起動時にこれらのスキルを必ず読み込んでください:

\```bash
cat skills/refactoring-patterns/SKILL.md
cat skills/code-smell-detection/SKILL.md
cat skills/tdd-principles/SKILL.md
\```

### 詳細リファレンス

必要に応じて以下のリファレンスを参照:

- `references/refactoring-catalog.md`: リファクタリングパターンカタログ
- `references/code-smells.md`: Code Smells詳細解説
- `references/testing-strategies.md`: テスト戦略ガイド
````

### ベストプラクティス

✅ **すべきこと**:

- 依存スキルを明示
- 読み込みコマンドを提供
- 段階的な参照構造

❌ **避けるべきこと**:

- 暗黙的な依存
- 過度な知識の重複
- 参照パスの不明瞭さ

## パターン5: Few-Shot Examples

### 概要

少数の具体例によって期待される動作を示すパターン。
典型例と境界例を含めることで学習効率を向上させます。

### 基本形式

```markdown
## 例

### 例1: {{シナリオ1}}

**入力**:
{{入力例1}}

**期待される出力**:
{{出力例1}}

### 例2: {{シナリオ2}}

**入力**:
{{入力例2}}

**期待される出力**:
{{出力例2}}
```

### 効果

- ✅ 期待される動作が明確になる
- ✅ エッジケースへの対応が向上
- ✅ 学習効率が上がる
- ✅ 一貫性が向上

### 推奨数

- **最小限**: 2個（典型例のみ）
- **推奨**: 3-4個（典型例 + 境界例）
- **最大**: 5個（それ以上は過度）

### 実装例

````markdown
## 例

### 例1: Long Methodの検出（典型例）

**入力**:
\```typescript
function processUserData(user) {
// 50行のコード
const validated = validateUser(user);
const normalized = normalizeData(validated);
const enriched = enrichWithMetadata(normalized);
const saved = saveToDatabase(enriched);
const notified = sendNotification(saved);
return notified;
}
\```

**期待される出力**:

- Code Smell検出: Long Method（50行）
- 推奨リファクタリング: Extract Method
- 提案: `processUserData`を5つのメソッドに分割
  - `validateUser()`
  - `normalizeData()`
  - `enrichWithMetadata()`
  - `saveToDatabase()`
  - `sendNotification()`

### 例2: Duplicate Codeの検出（典型例）

**入力**:
\```typescript
// ファイル1
function calculateTaxForProduct(price) {
const tax = price \* 0.1;
return price + tax;
}

// ファイル2
function calculateTaxForService(price) {
const tax = price \* 0.1;
return price + tax;
}
\```

**期待される出力**:

- Code Smell検出: Duplicate Code（2箇所）
- 推奨リファクタリング: Extract Function
- 提案: 共通の`calculateTotalWithTax(price)`を作成

### 例3: 境界ケース - リファクタリング不要

**入力**:
\```typescript
function add(a, b) {
return a + b;
}
\```

**期待される出力**:

- Code Smell検出: なし
- 理由: 単純明快な関数（3行以下）
- アクション: リファクタリング不要
````

### ベストプラクティス

✅ **すべきこと**:

- 実際の値を使用
- 典型例と境界例を含める
- 入力→処理→出力の流れを明示

❌ **避けるべきこと**:

- 10個以上の例
- 抽象的な例（`{{value}}`）
- 出力の不明確な例

## パターン6: Context Enhancement

### 概要

プロジェクト固有の知識や判断基準を明示するパターン。
文脈認識を向上させ、一貫した判断を実現します。

### 基本形式

```markdown
## コンテキスト強化

### プロジェクト固有の知識

このエージェントは以下のプロジェクトドキュメントを参照します:

- アーキテクチャ図: `docs/architecture.md`
- スタイルガイド: `docs/style-guide.md`
- コーディング規約: `docs/coding-standards.md`

### 判断基準

以下の基準に従って判断します:

- {{基準1}}
- {{基準2}}
```

### 効果

- ✅ プロジェクト固有の知識を活用
- ✅ 一貫した判断基準
- ✅ コンテキスト認識の向上

### 実装例

```markdown
## コンテキスト強化

### プロジェクト固有の知識

このエージェントは以下のドキュメントを参照します:

- アーキテクチャ図: `docs/architecture.md`
- TypeScript Style Guide: `docs/typescript-style-guide.md`
- テスト戦略: `docs/testing-strategy.md`

### 判断基準

以下の基準に従ってリファクタリングを判断します:

1. **複雑度基準**:
   - 循環的複雑度 > 10: 必須リファクタリング
   - 循環的複雑度 5-10: 推奨リファクタリング
   - 循環的複雑度 < 5: リファクタリング不要

2. **行数基準**:
   - メソッド > 20行: Extract Method検討
   - クラス > 200行: Extract Class検討
   - ファイル > 500行: モジュール分割検討

3. **重複基準**:
   - 重複コード > 5行 × 3箇所: Extract Function必須
   - 重複コード > 3行 × 5箇所: Extract Function推奨
```

## パターン7: Error Handling Directive

### 概要

エラー時の動作を明確に定義するパターン。
復旧可能性を向上させ、ユーザー体験を改善します。

### 基本形式

```markdown
## エラーハンドリング

### Retry戦略

- **最大試行回数**: {{max_retries}}
- **Retry条件**: {{retry_conditions}}

### Fallback動作

エラー時の代替動作:

1. {{fallback_1}}
2. {{fallback_2}}

### Escalation

以下の場合は上位エージェントにエスカレーション:

- {{escalation_condition_1}}
- {{escalation_condition_2}}
```

### 効果

- ✅ エラー時の動作が明確
- ✅ 復旧可能性の向上
- ✅ ユーザー体験の改善

### 実装例

````markdown
## エラーハンドリング

### Retry戦略

- **最大試行回数**: 3回
- **Retry条件**:
  - ファイル読み込み失敗（FileNotFound以外）
  - 一時的なネットワークエラー
  - タイムアウトエラー

### Fallback動作

エラー時の代替動作:

1. キャッシュから前回の分析結果を読み込み
2. 部分的な分析結果を返す（完全でない旨を明記）
3. エラーレポートを生成（`docs/error-report.md`）

### Escalation

以下の場合は上位エージェントにエスカレーション:

- ファイルが見つからない（FileNotFound）
- 権限エラー（Permission Denied）
- 構文エラー（Parse Error）
- 3回のRetry後も失敗

### エラーメッセージフォーマット

\```markdown

## エラー発生

**エラー種別**: {{error_type}}
**発生箇所**: {{location}}
**原因**: {{cause}}
**対処方法**: {{solution}}
**エスカレーション**: {{escalation_required}}
\```
````

## パターンの組み合わせ

### 効果的な組み合わせ

1. **Role Prompting + Structured Workflow**
   - 役割を明確にし、体系的なワークフローで実行

2. **Constrained Behavior + Few-Shot Examples**
   - 制約を示し、具体例で補強

3. **Knowledge Reference + Context Enhancement**
   - 外部知識を参照し、プロジェクト固有情報で強化

### 実装例: 完全なSystem Prompt

```markdown
# リファクタリングエージェント

## 役割 (Pattern 1: Role Prompting)

あなたは **リファクタリング専門家** です。
マーティン・ファウラー『リファクタリング』に基づき、
コード品質を体系的に改善します。

## ワークフロー (Pattern 3: Structured Workflow)

### Phase 1: Code Smells検出

...（詳細手順）

### Phase 2: リファクタリング計画

...（詳細手順）

## ベストプラクティス (Pattern 2: Constrained Behavior)

✅ **すべきこと**:

- 小さなステップで実施
- 各ステップでテスト実行

❌ **避けるべきこと**:

- テストなしリファクタリング
- 大規模一括変更

## 例 (Pattern 5: Few-Shot Examples)

### 例1: Long Method検出

...（具体例）

## スキル管理 (Pattern 4: Knowledge Reference)

依存スキル:

- `skills/code-smell-detection/SKILL.md`

## エラーハンドリング (Pattern 7: Error Handling)

Retry戦略: 3回まで
Fallback: 部分的な結果を返す
```

## ベストプラクティス

### すべきこと

- ✅ 複数のパターンを組み合わせる
- ✅ プロジェクトに応じてカスタマイズ
- ✅ 7セクション構造を維持
- ✅ 具体的な例を含める
- ✅ 測定可能な基準を設定

### 避けるべきこと

- ❌ パターンの過剰適用
- ❌ 不必要な複雑化
- ❌ 一貫性のない構造
- ❌ 曖昧な表現
- ❌ 過度な例示（5個以上）

## 次のステップ

パターンを理解したら、以下のリファレンスで実践:

1. **few-shot-techniques.md**: Few-Shot Learning技術の詳細
2. **optimization-strategies.md**: プロンプト最適化戦略
3. **anti-patterns.md**: よくある失敗パターン

## 参考文献

- The Pragmatic Programmer (Andrew Hunt, David Thomas)
- Prompt Engineering Guide (DAIR.AI)
- Anthropic Claude Prompt Engineering Guide
