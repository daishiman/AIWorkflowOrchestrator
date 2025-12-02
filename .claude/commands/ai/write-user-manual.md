---
description: |
  ユーザー中心のマニュアル・チュートリアルの作成。
  エンドユーザーが「やりたいこと」を達成できるドキュメントを作成します。

  🤖 起動エージェント:
  - `.claude/agents/manual-writer.md`: ユーザー中心ドキュメンテーション専門エージェント

  📚 利用可能スキル（manual-writerエージェントが必要時に参照）:
  **Phase 1（設計時）:** information-architecture
  **Phase 2（コンテンツ作成時）:** user-centric-writing, tutorial-design
  **Phase 3（サポート時）:** troubleshooting-guides
  **Phase 5（多言語化時）:** localization-i18n（必要時）

  ⚙️ このコマンドの設定:
  - argument-hint: 対象読者レベル（beginner/advanced/admin、オプション）
  - allowed-tools: エージェント起動と読み取り・書き込み用
    • Task: manual-writerエージェント起動
    • Read: プロジェクトドキュメント、既存マニュアル
    • Write(docs/manual/**|docs/tutorials/**): ユーザーマニュアル、チュートリアル
    • Edit: 既存ドキュメント更新
    • Grep: エラーメッセージ検索、用語一貫性チェック
  - model: sonnet（ユーザーマニュアル作成タスク）

  トリガーキーワード: manual, tutorial, guide, user, documentation
argument-hint: "[target-audience]"
allowed-tools:
  - Task
  - Read
  - Write(docs/manual/**|docs/tutorials/**)
  - Edit
  - Grep
model: sonnet
---

# ユーザーマニュアル作成コマンド

あなたは `/ai:write-user-manual` コマンドを実行します。

## 目的

エンドユーザーがサポートに頼らずに目的のタスクを完了できる、
ユーザー中心のマニュアル・チュートリアルを作成します。

## 実行フロー

### Phase 1: エージェント起動準備

**ユーザー引数の処理:**
- `$1` (target-audience): 対象読者レベル
  - `beginner`: 初心者向け（デフォルト）
  - `advanced`: 上級者向け
  - `admin`: 管理者向け

**コンテキスト収集:**
```bash
# 既存ドキュメント構造の確認
ls -la docs/
# プロジェクト機能の理解
grep -r "description:" src/features/*/schema.ts
```

### Phase 2: manual-writer エージェント起動

```typescript
`.claude/agents/manual-writer.md` を起動し、以下を依頼:

**タスク**: ユーザーマニュアルとチュートリアルの作成
**入力情報**:
- 対象読者: $TARGET_AUDIENCE
- プロジェクトコンテキスト: master_system_design.md
- 既存ドキュメント: docs/ ディレクトリ

**期待成果物**:
1. `docs/manual/user-guide.md`: 基本操作マニュアル
2. `docs/manual/quick-start.md`: クイックスタート（5-10分で完了）
3. `docs/tutorials/`: タスク別チュートリアル
4. `docs/manual/faq.md`: よくある質問
5. `docs/manual/troubleshooting.md`: トラブルシューティング

**成果物要件**:
- クイックスタートが10分以内で完了可能
- 手順が漏れなく記述されている
- 専門用語が説明されている
- 視覚資料（スクリーンショット、図解）を含む
- 対象読者のレベルに適した説明
```

### Phase 3: 完了報告

エージェントからの成果物を受け取り、ユーザーに以下を報告:
- ✅ 作成されたマニュアル一覧
- 📖 クイックスタート完了時間（目標: 10分以内）
- 🎯 カバーされた機能数
- 💡 作成されたFAQ項目数

## 注意事項

- このコマンドはマニュアル作成のみを行い、詳細はエージェントに委譲
- 開発者向けAPI仕様書は `/ai:generate-api-docs` を使用
- 対象読者に応じた適切な説明レベルで作成
