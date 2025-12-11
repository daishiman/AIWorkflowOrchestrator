---
description: |
  全ドキュメントの一括更新を行うコマンド。

  コードベースの変更に追従してドキュメント（仕様書、API、マニュアル）を
  自動的に更新し、コードとドキュメントの乖離を防ぎます。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/spec-writer.md` - 仕様書更新専門
  - Phase 3: `.claude/agents/api-doc-writer.md` - API仕様書更新専門
  - Phase 4: `.claude/agents/manual-writer.md` - ユーザーマニュアル更新専門

  📚 利用可能スキル（エージェントが参照）:
  - `.claude/skills/markdown-advanced-syntax/SKILL.md` - Markdown構造化、Mermaid図
  - `.claude/skills/api-documentation-best-practices/SKILL.md` - OpenAPI、エンドポイント記述
  - `.claude/skills/version-control-for-docs/SKILL.md` - 変更履歴管理、差分分析
  - `.claude/skills/technical-documentation-standards/SKILL.md` - IEEE 830、Documentation as Code

  ⚙️ このコマンドの設定:
  - argument-hint: なし
  - allowed-tools: 3エージェント起動とドキュメント更新用
    • Task: 3エージェント起動用
    • Read: 既存ドキュメント・コード確認用
    • Edit: ドキュメント更新用
    • Write(docs/**): 新規ドキュメント生成用
  - model: sonnet（標準的なドキュメント更新タスク）

  📋 成果物:
  - 更新された仕様書（`docs/20-specifications/`）
  - 更新されたAPI仕様（`docs/30-api/`）
  - 更新されたマニュアル（`docs/40-manuals/`）

  🎯 更新対象:
  - コード変更に追従した仕様書
  - APIエンドポイント仕様
  - ユーザーマニュアル
  - アーキテクチャ図

  トリガーキーワード: update docs, documentation, ドキュメント更新, 仕様書更新
argument-hint: ""
allowed-tools:
  - Task
  - Read
  - Edit
  - Write(docs/**)
model: sonnet
---

# 全ドキュメント一括更新

このコマンドは、全ドキュメントを一括更新します。

## 📋 実行フロー

### Phase 1: 変更内容の分析

**Git差分確認**:

```bash
# 前回のドキュメント更新以降の変更
git log --since="last-doc-update" --oneline

# 変更ファイル一覧
git diff HEAD~10 --name-only | grep "src/"
```

### Phase 2: spec-writerエージェントを起動（仕様書更新）

**使用エージェント**: `.claude/agents/spec-writer.md`

**依頼内容**:

```markdown
仕様書（`docs/20-specifications/`）を更新してください。

**変更内容**: ${git diff summary}

**要件**:

1. 機能仕様書の更新:
   - 新機能追加の反映
   - 変更箇所の更新
   - 図表の更新（Mermaid）

2. データフロー図の更新

3. 変更履歴の追記

**スキル参照**:

- `.claude/skills/markdown-advanced-syntax/SKILL.md`
- `.claude/skills/technical-documentation-standards/SKILL.md`

**成果物**: 更新された仕様書（Markdown）
```

### Phase 3: api-doc-writerエージェントを起動（API仕様更新）

**使用エージェント**: `.claude/agents/api-doc-writer.md`

**依頼内容**:

```markdown
API仕様書（`docs/30-api/`）を更新してください。

**変更内容**: ${API route changes}

**要件**:

1. エンドポイント仕様更新:
   - 新規エンドポイント追加
   - リクエスト/レスポンススキーマ更新
   - エラーレスポンス追加

2. サンプルリクエスト更新

3. OpenAPI仕様更新（該当する場合）

**スキル参照**: `.claude/skills/api-documentation-best-practices/SKILL.md`

**成果物**: 更新されたAPI仕様書
```

### Phase 4: manual-writerエージェントを起動（マニュアル更新）

**使用エージェント**: `.claude/agents/manual-writer.md`

**依頼内容**:

```markdown
ユーザーマニュアル（`docs/40-manuals/`）を更新してください。

**変更内容**: ${feature changes}

**要件**:

1. 使用方法の更新:
   - 新機能の使用例追加
   - UI変更の反映
   - トラブルシューティング追加

2. スクリーンショット更新（必要時）

**スキル参照**: `.claude/skills/progressive-disclosure/SKILL.md`

**成果物**: 更新されたマニュアル
```

### Phase 5: 完了報告

```markdown
## ドキュメント更新完了

### 更新サマリー

- 仕様書: ${spec_updated}件更新
- API仕様: ${api_updated}件更新
- マニュアル: ${manual_updated}件更新

### 主な変更

- 新機能追加: ${new_features}
- APIエンドポイント: ${new_endpoints}
- UI変更: ${ui_changes}

### Next Steps

1. ドキュメントレビュー
2. コミット: git commit -m "docs: update all documentation"
```

## 使用例

```bash
/ai:update-all-docs
```

自動実行:

1. 変更内容分析（Git差分）
2. 仕様書更新（spec-writer）
3. API仕様更新（api-doc-writer）
4. マニュアル更新（manual-writer）
5. 完了報告

## ベストプラクティス

### 定期更新スケジュール

```bash
# スプリント終了時（2週間毎）
/ai:update-all-docs

# または機能追加直後
/ai:update-all-docs
```

## 参照

- spec-writer: `.claude/agents/spec-writer.md`
- api-doc-writer: `.claude/agents/api-doc-writer.md`
- manual-writer: `.claude/agents/manual-writer.md`
