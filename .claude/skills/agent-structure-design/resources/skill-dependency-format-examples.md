# 📚 依存スキル形式の実例集

このドキュメントは、実際のエージェントで使用されている「📚 依存スキル」セクションの優れた実例を提供します。

## 実例1: sec-auditor（11スキル）

```yaml
description: |
  セキュリティ監査とコンプライアンス検証を専門とするエージェント。
  OWASP Top 10とCWE/SANSに基づき、脆弱性を体系的に検出・対策します。

  📚 依存スキル（11個）:
  このエージェントは以下のスキルに専門知識を分離しています。
  タスクに応じて必要なスキルのみを読み込んでください:

  - `.claude/skills/owasp-top-10/SKILL.md`: Injection、XSS、CSRF等の脆弱性検出
  - `.claude/skills/authentication-authorization-security/SKILL.md`: 認証・認可の安全性評価
  - `.claude/skills/input-validation-security/SKILL.md`: 入力サニタイゼーションとZod検証
  - `.claude/skills/cryptographic-practices/SKILL.md`: 暗号化、ハッシュ、鍵管理
  - `.claude/skills/session-management-security/SKILL.md`: セッション固定、hijacking対策
  - `.claude/skills/api-security/SKILL.md`: REST API、GraphQL、認証ヘッダー
  - `.claude/skills/dependency-security-scanning/SKILL.md`: pnpm audit、Snyk、SBOM
  - `.claude/skills/code-injection-prevention/SKILL.md`: SQL、Command、XPath Injection対策
  - `.claude/skills/code-static-analysis-security/SKILL.md`: ESLint security、Semgrep
  - `.claude/skills/security-configuration-review/SKILL.md`: CORS、CSP、HTTPS設定
  - `.claude/skills/threat-modeling/SKILL.md`: STRIDE、攻撃ツリー、リスク評価

  専門分野:
  - OWASP Top 10脆弱性検出とCWE/SANSパターン
  - 認証・認可フローのセキュリティレビュー
  - 入力検証とサニタイゼーション戦略
  - 暗号化実装とセキュアコーディング
  - 依存関係スキャンと脆弱性対応

  使用タイミング:
  - セキュリティ監査が必要な時
  - 脆弱性スキャンを実施する時
  - コンプライアンス検証時（PCI DSS、GDPR）
  - 認証フローのレビュー時
  - 本番デプロイ前の最終セキュリティチェック時
```

**特徴**:
- スキル数11個を正確に記載
- 各スキル説明が20-40文字で統一
- 技術用語を適切に使用
- 使用タイミングが具体的

## 実例2: logic-dev（5スキル）

```yaml
description: |
  ビジネスロジック実装を専門とするエージェント。
  マーティン・ファウラーの思想に基づき、可読性が高くテスト容易な
  業務処理コードを実装します。

  📚 依存スキル（5個）:
  このエージェントは以下のスキルに専門知識を分離しています。
  タスクに応じて必要なスキルのみを読み込んでください:

  - `.claude/skills/refactoring-techniques/SKILL.md`: リファクタリング技法とコードスメル検出
  - `.claude/skills/tdd-red-green-refactor/SKILL.md`: テスト駆動開発とRed-Green-Refactorサイクル
  - `.claude/skills/clean-code-practices/SKILL.md`: Clean Codeプラクティスと命名規約
  - `.claude/skills/transaction-script/SKILL.md`: トランザクションスクリプトパターンとExecutor実装
  - `.claude/skills/test-doubles/SKILL.md`: テストダブル選択とモック戦略

  専門分野:
  - Executorクラスの実装とビジネスロジックのコーディング
  - リファクタリング技術による可読性向上
  - テスト駆動開発（TDD）の実践
  - トランザクションスクリプトパターンの適用
  - Clean Codeプラクティスの遵守

  使用タイミング:
  - src/features/*/executor.ts 実装時
  - ビジネスロジックのリファクタリング時
  - 複雑な業務処理の実装時
  - データ加工・計算処理の実装時
  - テスト容易な設計が必要な時
```

**特徴**:
- スキル数5個で標準的な粒度
- 専門家名を明記（マーティン・ファウラー）
- 使用タイミングが具体的なファイルパス含む

## 実例3: prompt-eng（11スキル、複数技術列挙型）

```yaml
description: |
  Claude向けプロンプト設計と最適化を専門とするエージェント。
  プロンプトエンジニアリングのベストプラクティスに基づき、
  明確で効果的なプロンプトを設計します。

  📚 依存スキル（11個）:
  このエージェントは以下のスキルに専門知識を分離しています。
  タスクに応じて必要なスキルのみを読み込んでください:

  - `.claude/skills/chain-of-thought/SKILL.md`: 段階的推論と思考連鎖パターン
  - `.claude/skills/few-shot-learning-patterns/SKILL.md`: 効果的な例示選択と文脈構成
  - `.claude/skills/role-prompting/SKILL.md`: ペルソナ設計と専門家ロール割り当て
  - `.claude/skills/prompt-versioning-management/SKILL.md`: バージョン管理と段階的改善
  - `.claude/skills/hallucination-prevention/SKILL.md`: 幻覚抑制と根拠ベース推論
```

**特徴**:
- 各説明が技術用語を適切に列挙
- カンマ区切りで複数要素を表現
- 一貫した長さ（20-40文字）

## 実例4: ui-designer（6スキル、説明が詳細型）

```yaml
description: |
  スケーラブルで一貫性の高いUIコンポーネント設計を担当するエージェント。
  モジュラー設計、Compositionパターン、デザイントークン、WCAG準拠のアクセシビリティを
  実現し、Tailwind CSSとHeadless UIを活用した実装を行います。

  📚 依存スキル（6個）:
  このエージェントは以下のスキルに専門知識を分離しています。
  タスクに応じて必要なスキルのみを読み込んでください:

  - `.claude/skills/design-system-architecture/SKILL.md`: デザイントークン管理、コンポーネント規約、Figma統合
  - `.claude/skills/component-composition-patterns/SKILL.md`: Slot/Compound/Render Props、Controlled/Uncontrolled
  - `.claude/skills/headless-ui-principles/SKILL.md`: ロジックとプレゼンテーション分離、WAI-ARIAパターン
  - `.claude/skills/tailwind-css-patterns/SKILL.md`: ユーティリティファースト、カスタムクラス、レスポンシブ
  - `.claude/skills/accessibility-wcag/SKILL.md`: WCAG 2.1 AA準拠、ARIA、キーボードナビゲーション
  - `.claude/skills/apple-hig-guidelines/SKILL.md`: iOS/macOS/visionOSネイティブ品質、3テーマ、6原則
```

**特徴**:
- 技術スタック名を含む説明
- 複数のパターン/概念を列挙
- 説明の一貫性が高い

## 実例5: domain-modeler（Phase情報付き）

```yaml
description: |
  ドメイン駆動設計（DDD）に基づくドメインモデルの設計を専門とするエージェント。
  エリック・エヴァンスの思想に基づき、ビジネスルールをコードの中心に据え、
  技術的詳細から独立した堅牢なドメイン層を構築します。

  📚 依存スキル（5個）:
  このエージェントは以下のスキルに専門知識を分離しています。
  タスクに応じて必要なスキルのみを読み込んでください:

  - `.claude/skills/domain-driven-design/SKILL.md`: DDDの原則と実践パターン（Phase 1-2必須）
  - `.claude/skills/ubiquitous-language/SKILL.md`: ユビキタス言語の確立手法（Phase 1, 4必須）
  - `.claude/skills/value-object-patterns/SKILL.md`: 値オブジェクト設計パターン（Phase 2必須）
  - `.claude/skills/domain-services/SKILL.md`: ドメインサービスの配置設計（Phase 3推奨）
  - `.claude/skills/bounded-context/SKILL.md`: 境界付けられたコンテキスト定義（Phase 1推奨）
```

**特徴**:
- Phase情報を括弧内に追記（例: Phase 1-2必須）
- 必須/推奨を明示
- ワークフローとの連携が明確

## パターン別ガイド

### パターンA: 基本形（5-8スキル）

**用途**: 標準的な実装エージェント

**説明スタイル**: 核心機能を端的に

```yaml
- `.claude/skills/skill-name/SKILL.md`: [技術A]、[技術B]、[技術C]
```

**例**:
- `リトライ戦略、Exponential Backoff、Circuit Breaker`
- `正規化理論（1NF〜5NF）と意図的非正規化`

### パターンB: 複雑形（11-12スキル）

**用途**: 広範囲をカバーする監査・分析エージェント

**説明スタイル**: 具体的な検出対象や技術を列挙

```yaml
- `.claude/skills/skill-name/SKILL.md`: [検出対象1]、[検出対象2]、[手法]
```

**例**:
- `Injection、XSS、CSRF等の脆弱性検出`
- `段階的推論と思考連鎖パターン`

### パターンC: Phase情報付き

**用途**: ワークフローとスキルの結びつきが強いエージェント

**説明スタイル**: 基本説明 + （Phase情報）

```yaml
- `.claude/skills/skill-name/SKILL.md`: [基本説明]（Phase X必須）
```

**例**:
- `DDDの原則と実践パターン（Phase 1-2必須）`
- `ユビキタス言語の確立手法（Phase 1, 4必須）`

## 品質チェックリスト

エージェント作成完了時、以下を確認:

### 📚 依存スキル形式
- [ ] `📚 依存スキル（X個）:` でスキル数を正確に記載
- [ ] 導入文が統一（「このエージェントは以下のスキルに...」）
- [ ] 全スキルがフルパス（`.claude/skills/[name]/SKILL.md`）
- [ ] 各スキル説明が20-40文字
- [ ] 「パス:」行がない

### 専門分野セクション
- [ ] 3-5項目
- [ ] 「領域: 技術」形式

### 使用タイミングセクション
- [ ] 5項目推奨
- [ ] 具体的なシチュエーション

## 自動検証コマンド

```bash
# スキル数カウント
SKILL_COUNT=$(grep -c "^\s*-\s*\`\.claude/skills/" .claude/agents/agent-name.md)
echo "スキル数: $SKILL_COUNT"

# 宣言数との照合
DECLARED=$(grep "📚 依存スキル（.*個）:" .claude/agents/agent-name.md | sed -E 's/.*（([0-9]+)個）.*/\1/')
echo "宣言数: $DECLARED"

if [ "$SKILL_COUNT" -ne "$DECLARED" ]; then
  echo "❌ エラー: 数が一致しません"
else
  echo "✅ スキル数一致"
fi

# 説明文字数チェック（20-40文字推奨）
grep "^\s*-\s*\`\.claude/skills/" .claude/agents/agent-name.md | \
  sed -E 's/.*SKILL\.md\`: (.*)$/\1/' | \
  while read desc; do
    len=${#desc}
    if [ $len -lt 20 ] || [ $len -gt 50 ]; then
      echo "⚠️  説明が規定外（${len}文字）: $desc"
    fi
  done
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-27 | 初版作成 - 実エージェントから5つの実例を抽出 |
