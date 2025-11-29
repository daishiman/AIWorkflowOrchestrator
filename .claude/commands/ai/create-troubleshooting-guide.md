---
description: |
  トラブルシューティングガイドとFAQの作成。
  症状別の診断フローと解決策を提示し、ユーザーの自己解決率を向上させます。

  🤖 起動エージェント:
  - `.claude/agents/manual-writer.md`: ユーザー中心ドキュメンテーション専門エージェント

  📚 利用可能スキル（manual-writerエージェントが必要時に参照）:
  **Phase 3（サポートコンテンツ作成時）:** troubleshooting-guides（必須）
  **補助スキル:** user-centric-writing, information-architecture

  ⚙️ このコマンドの設定:
  - argument-hint: なし
  - allowed-tools: エージェント起動と読み取り・書き込み用
    • Task: manual-writerエージェント起動
    • Read: エラーログ、既存FAQ
    • Write(docs/manual/troubleshooting.md|docs/manual/faq.md): トラブルシューティング、FAQ
    • Grep: エラーメッセージ検索
  - model: sonnet（トラブルシューティングガイド作成タスク）

  トリガーキーワード: troubleshooting, faq, error, problem, issue
argument-hint: ""
allowed-tools: [Task, Read, Write(docs/manual/troubleshooting.md|docs/manual/faq.md), Grep]
model: sonnet
---

# トラブルシューティングガイド作成コマンド

あなたは `/ai:create-troubleshooting-guide` コマンドを実行します。

## 目的

症状別に分類された診断フローと解決策を提示し、
ユーザーがサポートに頼らずに問題を解決できるガイドを作成します。

## 実行フロー

### Phase 1: エージェント起動準備

**コンテキスト収集:**
```bash
# エラーメッセージの収集
grep -r "throw new" src/
grep -r "error" src/shared/core/errors/

# 既存FAQ確認
cat docs/manual/faq.md 2>/dev/null || echo "No existing FAQ"
```

### Phase 2: @manual-writer エージェント起動

```typescript
@manual-writer を起動し、以下を依頼:

**タスク**: トラブルシューティングガイドとFAQの作成
**フォーカス**: troubleshooting-guidesスキルを中心に活用

**入力情報**:
- エラーハンドリングコード: src/shared/core/errors/
- プロジェクトコンテキスト: master_system_design.md（7章: エラーハンドリング仕様）

**期待成果物**:
1. `docs/manual/troubleshooting.md`: トラブルシューティングガイド
   - 症状ごとの分類
   - 原因特定の段階的手順
   - 複数の解決方法の提示
2. `docs/manual/faq.md`: よくある質問（10項目以上）
   - 頻度順・カテゴリ別整理
   - 簡潔で直接的な回答
   - 詳細情報へのリンク

**成果物要件**:
- 頻出問題がカバーされている
- 診断フローが明確（フローチャート含む）
- エラーコードと対処法が紐づいている
- セルフサービス解決率 > 70%
```

### Phase 3: 完了報告

エージェントからの成果物を受け取り、ユーザーに以下を報告:
- ✅ カバーされた問題カテゴリ数
- 📋 FAQ項目数
- 🔍 診断フロー数
- 💡 期待されるセルフサービス解決率

## 注意事項

- このコマンドはガイド作成のみを行い、詳細はエージェントに委譲
- エラーハンドリングの実装は対象外
- ユーザー視点の説明を重視
