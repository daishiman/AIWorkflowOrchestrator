---
description: |
  包括的なコードレビューを実施するコマンド。

  アーキテクチャ、品質、セキュリティ、ビジネスロジックの4領域を多角的にレビューし、
  総合的な改善提案を提供します。

  🤖 起動エージェント（領域別）:
  - Phase 1: `.claude/agents/arch-police.md` - Clean Architecture、依存関係、レイヤー違反検出
  - Phase 2: `.claude/agents/code-quality.md` - SOLID原則、Clean Code、リファクタリング提案
  - Phase 3: `.claude/agents/sec-auditor.md` - セキュリティ脆弱性、OWASP Top 10
  - Phase 4: `.claude/agents/logic-dev.md` - ビジネスロジック妥当性、エッジケース検証

  📚 利用可能スキル（エージェントが参照）:
  **アーキテクチャ（Phase 1）:**
  - `.claude/skills/clean-architecture-principles/SKILL.md` - 依存関係ルール、レイヤー分離
  - `.claude/skills/solid-principles/SKILL.md` - SOLID原則評価（SRP/OCP/LSP/ISP/DIP）
  - `.claude/skills/dependency-analysis/SKILL.md` - 依存グラフ、循環依存検出
  - `.claude/skills/architectural-patterns/SKILL.md` - Hexagonal/Onion/Vertical Slice

  **品質（Phase 2）:**
  - `.claude/skills/code-smell-detection/SKILL.md` - コードスメル検出パターン
  - `.claude/skills/refactoring-techniques/SKILL.md` - 安全なリファクタリング手法
  - `.claude/skills/clean-code-practices/SKILL.md` - Clean Code原則、命名規則

  **セキュリティ（Phase 3）:**
  - `.claude/skills/owasp-top-10/SKILL.md` - OWASP脆弱性対策（Injection/XSS等）
  - `.claude/skills/input-validation-patterns/SKILL.md` - 入力検証、サニタイゼーション
  - `.claude/skills/authentication-patterns/SKILL.md` - 認証・認可パターン

  **ロジック（Phase 4）:**
  - `.claude/skills/bounded-context/SKILL.md` - DDD境界コンテキスト
  - `.claude/skills/ubiquitous-language/SKILL.md` - ドメイン用語統一
  - `.claude/skills/transaction-management/SKILL.md` - トランザクション管理、ACID

  ⚙️ このコマンドの設定:
  - argument-hint: "[target-path]"（オプション、未指定時は全体レビュー）
  - allowed-tools: 4エージェント起動と読み取り専用
    • Task: 4エージェント起動用
    • Read: コード・ドキュメント確認用（全ファイル）
    • Grep, Glob: コード検索用
    • Write(docs/**): レビューレポート生成用（docs/のみ）
  - model: opus（複雑な4エージェント調整と多角的分析が必要）

  📋 成果物:
  - `.claude/docs/reviews/code-review-${timestamp}.md`（総合レビューレポート）
  - 領域別レポート:
    - アーキテクチャレビュー
    - 品質レビュー
    - セキュリティレビュー
    - ロジックレビュー
  - 優先順位付き改善提案リスト
  - リファクタリング計画

  🎯 レビュー観点:
  - Clean Architecture: 依存方向、レイヤー責務、境界の明確性
  - SOLID原則: SRP, OCP, LSP, ISP, DIP
  - セキュリティ: OWASP Top 10、入力バリデーション、認証・認可
  - ビジネスロジック: ドメインモデル妥当性、エッジケース、エラーハンドリング
  - パフォーマンス: N+1問題、不要なレンダリング、メモリリーク
  - 保守性: 命名、複雑度、テスト可能性

  トリガーキーワード: code review, レビュー, 品質チェック, アーキテクチャレビュー, comprehensive review
argument-hint: "[target-path]"
allowed-tools:
   - Task
   - Read
   - Grep
   - Glob
   - Write(docs/**)
model: opus
---

# 包括的コードレビュー

このコマンドは、アーキテクチャ、品質、セキュリティ、ロジックの4領域を包括的にレビューします。

## 📋 実行フロー

### Phase 1: レビュー範囲の確認

**引数解析**:
```bash
# ターゲットパス指定あり
target-path: "$ARGUMENTS"（例: src/features/auth, src/app/api）

# 未指定の場合
target-path: "."（全体レビュー）
```

### Phase 2: アーキテクチャレビュー（arch-police）

**使用エージェント**: `.claude/agents/arch-police.md`

**エージェントへの依頼内容**:
```markdown
パス「${target-path}」のアーキテクチャをレビューしてください。

**レビュー観点**:
1. Clean Architecture準拠:
   - 依存方向チェック（app → features → infrastructure → core）
   - レイヤー責務の明確性
   - 境界の適切性

2. ハイブリッド構造準拠:
   - shared/（共通インフラ）とfeatures/（機能プラグイン）の責務分離
   - 機能間の独立性（相互依存禁止）

3. 依存関係分析:
   - 循環依存検出
   - 不要な依存の検出
   - 安定度メトリクス

**スキル参照**:
- `.claude/skills/clean-architecture-principles/SKILL.md`
- `.claude/skills/dependency-analysis/SKILL.md`
- `.claude/skills/architectural-patterns/SKILL.md`

**成果物**:
- アーキテクチャレビューレポート（違反リスト、依存関係図、改善提案）
```

### Phase 3: 品質レビュー（code-quality）

**使用エージェント**: `.claude/agents/code-quality.md`

**エージェントへの依頼内容**:
```markdown
パス「${target-path}」のコード品質をレビューしてください。

**レビュー観点**:
1. SOLID原則（SRP, OCP, LSP, ISP, DIP）
2. Clean Code原則（意味のある命名、関数の単一責任、コメント最小化）
3. コードスメル検出:
   - 長い関数（>50行）
   - 複雑な条件分岐（cyclomatic complexity > 10）
   - 重複コード（DRY違反）
   - God Class（責務過多）
4. 静的解析（TypeScript, ESLint, Prettier）

**スキル参照**:
- `.claude/skills/solid-principles/SKILL.md`
- `.claude/skills/clean-code-practices/SKILL.md`
- `.claude/skills/code-smell-detection/SKILL.md`
- `.claude/skills/refactoring-techniques/SKILL.md`

**成果物**:
- 品質レビューレポート（コードスメルリスト、SOLID違反、リファクタリング提案）
```

### Phase 4: セキュリティレビュー（sec-auditor）

**使用エージェント**: `.claude/agents/sec-auditor.md`

**エージェントへの依頼内容**:
```markdown
パス「${target-path}」のセキュリティをレビューしてください。

**レビュー観点**:
1. OWASP Top 10（A01-A10）
2. 入力バリデーション（Zodスキーマ網羅性、サニタイゼーション）
3. 認証・認可（トークン検証、権限チェック）
4. 機密情報管理（環境変数化、ログマスキング）
5. 依存関係脆弱性（`pnpm audit`）

**スキル参照**:
- `.claude/skills/owasp-top-10/SKILL.md`
- `.claude/skills/input-validation-patterns/SKILL.md`

**成果物**:
- セキュリティレビューレポート（脆弱性リスト、リスクレベル、修正提案）
```

### Phase 5: ビジネスロジックレビュー（logic-dev）

**使用エージェント**: `.claude/agents/logic-dev.md`

**エージェントへの依頼内容**:
```markdown
パス「${target-path}」のビジネスロジックをレビューしてください。

**レビュー観点**:
1. ドメインモデル妥当性（エンティティ、集約、境界）
2. エッジケース処理（境界値、nullish値、異常系）
3. エラーハンドリング（7.1-7.3章準拠、リトライ戦略）
4. トランザクション管理（ACID特性、ロールバック）
5. ビジネスルール実装（仕様書との整合性）

**スキル参照**:
- `.claude/skills/bounded-context/SKILL.md`
- `.claude/skills/transaction-management/SKILL.md`

**成果物**:
- ロジックレビューレポート（ビジネスルール検証、エッジケース不足、改善提案）
```

### Phase 6: 総合レポート生成

**実行内容**:
```markdown
## 総合コードレビューレポート

### レビューサマリー
- レビュー範囲: ${target-path}
- レビュー日時: ${timestamp}
- レビュー観点: アーキテクチャ、品質、セキュリティ、ロジック

### 優先度別改善提案

#### 🔴 Critical（即座の対応必須）
[Critical問題のリスト]

#### 🟡 High（早急な対応推奨）
[High問題のリスト]

#### 🟢 Medium（計画的な対応）
[Medium問題のリスト]

#### 🔵 Low（改善余地）
[Low問題のリスト]

### 領域別詳細
- アーキテクチャ: [詳細レポートへのリンク]
- 品質: [詳細レポートへのリンク]
- セキュリティ: [詳細レポートへのリンク]
- ロジック: [詳細レポートへのリンク]

### Next Steps
1. Critical問題の修正
2. High問題の計画
3. リファクタリング実施
4. 再レビュー
```

## 使用例

### 全体レビュー

```bash
/ai:code-review-complete
```

### 特定パスのレビュー

```bash
/ai:code-review-complete src/features/auth
```

## 参照

- arch-police: `.claude/agents/arch-police.md`
- code-quality: `.claude/agents/code-quality.md`
- sec-auditor: `.claude/agents/sec-auditor.md`
- logic-dev: `.claude/agents/logic-dev.md`
