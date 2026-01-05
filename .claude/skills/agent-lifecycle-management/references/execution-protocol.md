# エージェント実行プロトコル詳細

エージェント設計時の実行フローと判断基準の詳細ガイド。

## エージェント設計の基本フロー

```
1. 要件理解
   ↓
2. agent-persona-design参照 → ペルソナ設計
   ↓
3. agent-structure-design参照 → 構造設計
   agent-architecture-patterns参照 → パターン選択
   ↓
4. agent-dependency-design参照 → 依存関係設計
   multi-agent-systems参照 → 協調プロトコル
   ↓
5. agent-quality-standards参照 → 品質基準設定
   agent-validation-testing参照 → テスト設計
   ↓
6. 完了・引き継ぎ
```

## Phase別スキル参照マトリクス

### Phase 1: 要件理解と分析

**必須スキル**:

- `.claude/skills/agent-persona-design/SKILL.md`: ペルソナと役割定義

**オプションスキル**:

- `.claude/skills/agent-architecture-patterns/SKILL.md`: 既存パターンの確認

**判断基準**:

- [ ] 専門家モデリングが必要か？ → .claude/skills/agent-persona-design/SKILL.md
- [ ] 役割ベース設計が適切か？ → .claude/skills/agent-persona-design/SKILL.md
- [ ] 既存アーキテクチャパターンに該当するか？ → .claude/skills/agent-architecture-patterns/SKILL.md

### Phase 2: エージェント構造の設計

**必須スキル**:

- `.claude/skills/agent-structure-design/SKILL.md`: YAML Frontmatter、システムプロンプト設計
- `.claude/skills/tool-permission-management/SKILL.md`: ツール権限設定

**オプションスキル**:

- `.claude/skills/agent-architecture-patterns/SKILL.md`: パターン適用
- `.claude/skills/prompt-engineering-for-agents/SKILL.md`: プロンプト最適化

**判断基準**:

- [ ] YAML Frontmatterを設計する必要があるか？ → .claude/skills/agent-structure-design/SKILL.md（必須）
- [ ] ファイル操作が必要か？ → .claude/skills/tool-permission-management/SKILL.md（必須）
- [ ] アーキテクチャパターンを適用するか？ → .claude/skills/agent-architecture-patterns/SKILL.md
- [ ] プロンプトチューニングが必要か？ → .claude/skills/prompt-engineering-for-agents/SKILL.md

### Phase 3: 依存関係とインターフェースの設計

**必須スキル**:

- `.claude/skills/agent-dependency-design/SKILL.md`: スキル参照、エージェント間協調

**オプションスキル**:

- `.claude/skills/multi-agent-systems/SKILL.md`: マルチエージェント協調パターン

**判断基準**:

- [ ] スキルに依存するか？ → .claude/skills/agent-dependency-design/SKILL.md（必須）
- [ ] 他のエージェントと協調するか？ → .claude/skills/agent-dependency-design/SKILL.md（必須）
- [ ] 3つ以上のエージェントが連携するか？ → .claude/skills/multi-agent-systems/SKILL.md

### Phase 4: 品質基準とチェックリストの定義

**必須スキル**:

- `.claude/skills/agent-quality-standards/SKILL.md`: 完了条件、品質メトリクス
- `.claude/skills/agent-lifecycle-management/SKILL.md`: ライフサイクル管理

**オプションスキル**:

- `.claude/skills/project-architecture-integration/SKILL.md`: プロジェクト準拠確認

**判断基準**:

- [ ] 完了条件を定義する必要があるか？ → .claude/skills/agent-quality-standards/SKILL.md（必須）
- [ ] エラーハンドリング戦略が必要か？ → .claude/skills/agent-quality-standards/SKILL.md（必須）
- [ ] 複雑なライフサイクルを持つか？ → .claude/skills/agent-lifecycle-management/SKILL.md（必須）
- [ ] プロジェクト構造に準拠する必要があるか？ → .claude/skills/project-architecture-integration/SKILL.md

### Phase 5: ファイル生成と検証

**必須スキル**:

- `.claude/skills/agent-validation-testing/SKILL.md`: 構文検証、テストケース作成
- `.claude/skills/agent-template-patterns/SKILL.md`: テンプレート適用

**オプションスキル**:

- `.claude/skills/project-architecture-integration/SKILL.md`: アーキテクチャ準拠チェック

**判断基準**:

- [ ] YAML構文検証が必要か？ → .claude/skills/agent-validation-testing/SKILL.md（必須）
- [ ] テストケースを作成するか？ → .claude/skills/agent-validation-testing/SKILL.md（必須）
- [ ] テンプレートを使用するか？ → .claude/skills/agent-template-patterns/SKILL.md（必須）
- [ ] プロジェクトアーキテクチャへの準拠確認が必要か？ → .claude/skills/project-architecture-integration/SKILL.md

## スキル参照タイミングの詳細判断基準

### .claude/skills/agent-architecture-patterns/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] アーキテクチャパターン（オーケストレーター、パイプライン等）を選択する必要がある
- [ ] マルチエージェント構造を設計する

**オプション条件**:

- [ ] 設計原則（単一責任、最小権限等）を適用する
- [ ] 既存パターンの確認が有益

**参照コマンド**:

```bash
cat .claude/skills/agent-architecture-patterns/SKILL.md
```

### .claude/skills/agent-structure-design/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] YAML Frontmatterを設計する（すべてのエージェント）
- [ ] システムプロンプト構造を決定する（すべてのエージェント）
- [ ] ワークフローを設計する（すべてのエージェント）

**参照コマンド**:

```bash
cat .claude/skills/agent-structure-design/SKILL.md
```

### .claude/skills/agent-dependency-design/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] エージェントがスキルを参照する（ほぼすべてのエージェント）
- [ ] エージェント間の情報受け渡しを設計する

**オプション条件**:

- [ ] 依存関係の循環を検出・解消する

**参照コマンド**:

```bash
cat .claude/skills/agent-dependency-design/SKILL.md
```

### .claude/skills/agent-quality-standards/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] 完了条件を設計する（すべてのエージェント）
- [ ] 品質メトリクスを定義する

**オプション条件**:

- [ ] エラーハンドリング戦略を設計する

**参照コマンド**:

```bash
cat .claude/skills/agent-quality-standards/SKILL.md
```

### .claude/skills/agent-validation-testing/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] エージェントファイル生成後の検証（すべてのエージェント）
- [ ] YAML構文検証

**オプション条件**:

- [ ] テストケースを作成する
- [ ] デプロイ前の最終検証

**参照コマンド**:

```bash
cat .claude/skills/agent-validation-testing/SKILL.md
```

### .claude/skills/agent-template-patterns/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] エージェントファイルを生成する（すべてのエージェント）

**オプション条件**:

- [ ] 新しいエージェントタイプのテンプレートを作成する
- [ ] 既存エージェントを汎用化する
- [ ] エージェント量産のための標準化が必要

**参照コマンド**:

```bash
cat .claude/skills/agent-template-patterns/SKILL.md
```

### .claude/skills/project-architecture-integration/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] エージェントがプロジェクト構造に準拠したファイルを生成する

**オプション条件**:

- [ ] データベース操作を行うエージェントを設計する
- [ ] API連携エージェントを設計する

**参照コマンド**:

```bash
cat .claude/skills/project-architecture-integration/SKILL.md
```

### .claude/skills/agent-persona-design/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] エージェントのペルソナを設計する（すべてのエージェント）

**オプション条件**:

- [ ] 専門家モデルを選定する
- [ ] 役割と責任範囲を定義する

**参照コマンド**:

```bash
cat .claude/skills/agent-persona-design/SKILL.md
```

### .claude/skills/tool-permission-management/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] エージェントがファイル操作を行う

**オプション条件**:

- [ ] パス制限を設定する
- [ ] セキュリティリスクを評価する

**参照コマンド**:

```bash
cat .claude/skills/tool-permission-management/SKILL.md
```

### .claude/skills/multi-agent-systems/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] 3つ以上のエージェントが協調する

**オプション条件**:

- [ ] ハンドオフプロトコルを定義する
- [ ] エージェント間の依存関係を設計する（2エージェント間）

**参照コマンド**:

```bash
cat .claude/skills/multi-agent-systems/SKILL.md
```

### .claude/skills/prompt-engineering-for-agents/SKILL.mdを参照するタイミング

**オプション条件**:

- [ ] System Promptを最適化する
- [ ] エージェントの動作を最適化する
- [ ] 具体例を追加する

**参照コマンド**:

```bash
cat .claude/skills/prompt-engineering-for-agents/SKILL.md
```

### .claude/skills/agent-lifecycle-management/SKILL.mdを参照するタイミング

**必須条件**:

- [ ] エージェントの完了条件を定義する（すべてのエージェント）

**オプション条件**:

- [ ] エージェントのライフサイクルを設計する
- [ ] バージョン管理戦略を定義する
- [ ] メンテナンス計画を策定する

**参照コマンド**:

```bash
cat .claude/skills/agent-lifecycle-management/SKILL.md
```

## 実行フロー決定木

```
エージェント作成要求を受信
  ↓
Phase 1: 要件理解
  → ペルソナ設計が必要？
     YES → agent-persona-design参照
     NO  → 次へ
  ↓
Phase 2: 構造設計
  → YAML Frontmatter設計（必須）
     → agent-structure-design参照
  → ファイル操作が必要？
     YES → tool-permission-management参照
     NO  → 次へ
  → アーキテクチャパターン適用？
     YES → agent-architecture-patterns参照
     NO  → 次へ
  ↓
Phase 3: 依存関係設計
  → スキル参照が必要？（ほぼ必須）
     YES → agent-dependency-design参照
  → 他エージェントと協調？
     YES → agent-dependency-design参照
  → 3エージェント以上が協調？
     YES → multi-agent-systems参照
     NO  → 次へ
  ↓
Phase 4: 品質基準設定
  → 完了条件定義（必須）
     → agent-quality-standards参照
     → agent-lifecycle-management参照
  → プロジェクト準拠確認？
     YES → project-architecture-integration参照
     NO  → 次へ
  ↓
Phase 5: 検証
  → ファイル生成（必須）
     → agent-template-patterns参照
     → agent-validation-testing参照
  → プロンプト最適化？
     YES → prompt-engineering-for-agents参照
     NO  → 完了
```

## エラーハンドリングプロトコル

### スキル参照エラー

- **症状**: スキルファイルが見つからない
- **対処**: パスを相対パス（`.claude/skills/...`）で確認

### 循環依存エラー

- **症状**: エージェント間で循環参照が発生
- **対処**: `.claude/skills/agent-dependency-design/SKILL.md`の循環依存検出スクリプトを実行
  ```bash
  node .claude/skills/agent-dependency-design/scripts/check-circular-deps.mjs [agent-file.md]
  ```

### YAML構文エラー

- **症状**: Frontmatterが正しく解析されない
- **対処**: `.claude/skills/agent-structure-design/SKILL.md`の構造検証スクリプトを実行
  ```bash
  node .claude/skills/agent-structure-design/scripts/validate-structure.mjs [agent-file.md]
  ```

### 品質基準未達

- **症状**: 品質スコアが基準を下回る
- **対処**: `.claude/skills/agent-quality-standards/SKILL.md`の品質スコア算出スクリプトを実行
  ```bash
  node .claude/skills/agent-quality-standards/scripts/calculate-quality-score.mjs [agent-file.md]
  ```

## ベストプラクティス

### スキル参照の効率化

1. **Phase別に必要なスキルをまとめて参照**
   - Phase 1開始時: persona-design
   - Phase 2開始時: structure-design + tool-permission + architecture-patterns
   - Phase 3開始時: dependency-design + .claude/skills/multi-agent-systems/SKILL.md
   - Phase 4開始時: quality-standards + lifecycle-management
   - Phase 5開始時: validation-testing + template-patterns

2. **条件判断の明確化**
   - 各Phaseの冒頭で条件を確認
   - 不要なスキル参照を避ける

3. **検証の徹底**
   - 各Phase完了後にチェックリスト確認
   - 最終検証では全スクリプトを実行

## 関連ドキュメント

- **YAML description規則**: `.claude/skills/agent-structure-design/resources/yaml-description-rules.md`
- **テンプレート参照ガイド**: `.claude/skills/agent-template-patterns/resources/template-reference-guide.md`
- **品質メトリクス**: `.claude/skills/agent-quality-standards/resources/quality-metrics.md`
