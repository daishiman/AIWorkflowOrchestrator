# テンプレート統合参照ガイド

エージェント作成時に参照可能なすべてのテンプレートと、そのアクセスコマンドの一覧。

## テンプレートカテゴリ

### エージェントテンプレート

#### 統一エージェントテンプレート

- **パス**: `.claude/skills/agent-template-patterns/templates/unified-agent-template.md`
- **用途**: 標準的なエージェント構造のベーステンプレート
- **対象**: すべてのエージェントタイプ

```bash
cat .claude/skills/agent-template-patterns/templates/unified-agent-template.md
```

### アーキテクチャパターンテンプレート

#### オーケストレーター・ワーカーテンプレート

- **パス**: `.claude/skills/agent-architecture-patterns/templates/orchestrator-worker-template.md`
- **用途**: マルチエージェント協調パターン
- **対象**: 複雑なタスクを分散処理するシステム

```bash
cat .claude/skills/agent-architecture-patterns/templates/orchestrator-worker-template.md
```

#### パイプラインテンプレート

- **パス**: `.claude/skills/agent-architecture-patterns/templates/pipeline-template.md`
- **用途**: 段階的処理フロー
- **対象**: データ変換・処理パイプライン

```bash
cat .claude/skills/agent-architecture-patterns/templates/pipeline-template.md
```

### 品質管理テンプレート

#### 品質チェックリストテンプレート

- **パス**: `.claude/skills/agent-quality-standards/templates/quality-checklist-template.md`
- **用途**: エージェント品質評価基準
- **対象**: すべてのエージェント（品質検証時）

```bash
cat .claude/skills/agent-quality-standards/templates/quality-checklist-template.md
```

### 協調プロトコルテンプレート

#### ハンドオフプロトコルテンプレート（依存関係設計）

- **パス**: `.claude/skills/agent-dependency-design/templates/handoff-protocol-template.json`
- **用途**: エージェント間情報受け渡し仕様
- **対象**: エージェント間連携が必要な場合

```bash
cat .claude/skills/agent-dependency-design/templates/handoff-protocol-template.json
```

#### ハンドオフプロトコルテンプレート（マルチエージェント）

- **パス**: `.claude/skills/multi-agent-systems/templates/handoff-protocol-template.json`
- **用途**: マルチエージェントシステムの協調仕様
- **対象**: 複数エージェントの同時協調

```bash
cat .claude/skills/multi-agent-systems/templates/handoff-protocol-template.json
```

### テストテンプレート

#### テストケーステンプレート

- **パス**: `.claude/skills/agent-validation-testing/templates/test-case-template.json`
- **用途**: エージェント動作検証用テストケース
- **対象**: すべてのエージェント（テスト作成時）

```bash
cat .claude/skills/agent-validation-testing/templates/test-case-template.json
```

### アーキテクチャ準拠テンプレート

#### アーキテクチャ準拠チェックリスト

- **パス**: `.claude/skills/project-architecture-integration/templates/architecture-compliance-checklist.md`
- **用途**: プロジェクトアーキテクチャへの準拠確認
- **対象**: プロジェクト構造に依存するエージェント

```bash
cat .claude/skills/project-architecture-integration/templates/architecture-compliance-checklist.md
```

### ペルソナ設計テンプレート

#### ペルソナ設計テンプレート

- **パス**: `.claude/skills/agent-persona-design/templates/persona-template.md`
- **用途**: エージェントのペルソナ・役割定義
- **対象**: 専門家モデリングが必要なエージェント

```bash
cat .claude/skills/agent-persona-design/templates/persona-template.md
```

### ツール権限テンプレート

#### ツール権限設定テンプレート

- **パス**: `.claude/skills/tool-permission-management/templates/permission-template.yaml`
- **用途**: ツールアクセス権限とパス制限設定
- **対象**: ファイル操作を行うすべてのエージェント

```bash
cat .claude/skills/tool-permission-management/templates/permission-template.yaml
```

### プロンプトテンプレート

#### プロンプト設計テンプレート

- **パス**: `.claude/skills/prompt-engineering-for-agents/templates/prompt-template.md`
- **用途**: System Prompt最適化
- **対象**: プロンプトチューニングが必要なエージェント

```bash
cat .claude/skills/prompt-engineering-for-agents/templates/prompt-template.md
```

### ライフサイクル管理テンプレート

#### ライフサイクル管理テンプレート

- **パス**: `.claude/skills/agent-lifecycle-management/templates/lifecycle-template.md`
- **用途**: エージェントの起動・実行・終了プロトコル
- **対象**: 複雑なライフサイクルを持つエージェント

```bash
cat .claude/skills/agent-lifecycle-management/templates/lifecycle-template.md
```

## テンプレート選択ガイド

### エージェントタイプ別推奨テンプレート

#### 単一機能エージェント

- unified-agent-template.md（必須）
- persona-template.md（推奨）
- permission-template.yaml（ファイル操作時）

#### オーケストレーター型エージェント

- orchestrator-worker-template.md（必須）
- handoff-protocol-template.json（必須）
- quality-checklist-template.md（推奨）

#### パイプライン型エージェント

- pipeline-template.md（必須）
- test-case-template.json（推奨）

#### プロジェクト統合型エージェント

- architecture-compliance-checklist.md（必須）
- permission-template.yaml（必須）

### Phase別テンプレート活用

#### Phase 1: 要件理解と分析

- persona-template.md

#### Phase 2: エージェント構造の設計

- unified-agent-template.md
- permission-template.yaml
- lifecycle-template.md

#### Phase 3: 依存関係とインターフェースの設計

- handoff-protocol-template.json（依存関係設計）
- handoff-protocol-template.json（マルチエージェント）

#### Phase 4: 品質基準とチェックリストの定義

- quality-checklist-template.md
- architecture-compliance-checklist.md

#### Phase 5: ファイル生成と検証

- test-case-template.json
- prompt-template.md（最適化時）

## テンプレート統合ワークフロー

### ステップ1: エージェントタイプの決定

```bash
# 単一機能 or オーケストレーター or パイプライン
```

### ステップ2: ベーステンプレートの選択

```bash
cat .claude/skills/agent-template-patterns/templates/unified-agent-template.md
# または
cat .claude/skills/agent-architecture-patterns/templates/orchestrator-worker-template.md
```

### ステップ3: 補完テンプレートの追加

```bash
# ペルソナ設計
cat .claude/skills/agent-persona-design/templates/persona-template.md

# ツール権限設定
cat .claude/skills/tool-permission-management/templates/permission-template.yaml
```

### ステップ4: 検証テンプレートの適用

```bash
# 品質チェックリスト
cat .claude/skills/agent-quality-standards/templates/quality-checklist-template.md

# テストケース
cat .claude/skills/agent-validation-testing/templates/test-case-template.json
```

## テンプレート活用のベストプラクティス

### DO（推奨）

✅ テンプレートを組み合わせて使用（複数テンプレートの統合）
✅ プロジェクト固有の要件に合わせてカスタマイズ
✅ テンプレートの変数部分（{{variable}}）を適切に置換
✅ Phase別に必要なテンプレートを順次参照

### DON'T（非推奨）

❌ テンプレートをそのままコピペ（カスタマイズなし）
❌ 必須テンプレートの省略
❌ 変数部分の置換忘れ
❌ 複数テンプレートの矛盾した組み合わせ

## バージョン管理

すべてのテンプレートはセマンティックバージョニングで管理されています。
各テンプレートファイル内の「## バージョン履歴」セクションを参照してください。

## 関連ドキュメント

- **YAML description規則**: `.claude/skills/agent-structure-design/resources/yaml-description-rules.md`
- **パターンカタログ**: `.claude/skills/agent-architecture-patterns/resources/pattern-catalog.md`
- **品質メトリクス**: `.claude/skills/agent-quality-standards/resources/quality-metrics.md`
