---
description: |
  Electronアプリケーションのセキュリティ強化を行う専門コマンド。

  サンドボックス、CSP、IPC安全性、依存関係の脆弱性監査を実施し、
  セキュアなアプリケーションを構築します。

  🤖 起動エージェント:
  - `.claude/agents/electron-security.md`: Electronセキュリティ専門エージェント

  📚 利用可能スキル（electron-securityエージェントが必要時に参照）:
  **必須スキル:** electron-security-hardening

  ⚙️ このコマンドの設定:
  - argument-hint: [scope] - 監査スコープ（full/config/ipc/csp/deps）
  - allowed-tools: セキュリティ監査に必要な権限
    • Task: electron-securityエージェント起動用
    • Read: 既存ファイル確認用
    • Write: セキュリティ設定ファイル生成用
    • Edit: 既存ファイル修正用
    • Grep: パターン検索用
    • Bash: npm audit等の実行用
  - model: sonnet（セキュリティ監査タスク）

  🎯 成果物:
  - セキュリティ監査レポート
  - CSP設定（src/main/security/csp.ts）
  - セキュアPreloadテンプレート
  - セキュリティチェックリスト

  トリガーキーワード: electron, security, セキュリティ, csp, sandbox, 脆弱性
argument-hint: "[scope]"
allowed-tools:
  - Task
  - Read
  - Write(src/**|.claude/docs/**)
  - Edit
  - Grep
  - Glob
  - Bash
model: sonnet
---

# Electronセキュリティ強化

## 目的

`.claude/agents/electron-security.md` エージェントを起動し、Electronアプリケーションのセキュリティを強化します。

## エージェント起動フロー

### Phase 1: 引数確認とコンテキスト収集

```markdown
監査スコープ: "$ARGUMENTS"（full/config/ipc/csp/deps）

引数未指定の場合:
- デフォルトでfull（完全監査）を実行
- または、対話的にスコープを選択
```

### Phase 2: electron-security エージェント起動

Task ツールで `.claude/agents/electron-security.md` を起動:

```markdown
エージェント: .claude/agents/electron-security.md
監査スコープ: ${scope}

依頼内容:
- BrowserWindowセキュリティ設定の監査
- Preloadスクリプトのセキュリティレビュー
- IPCハンドラーの入力検証確認
- CSPポリシーの設計と実装
- 依存関係の脆弱性監査（npm audit）

監査項目:
【Critical】
- contextIsolation: true
- nodeIntegration: false
- ipcRenderer直接公開なし
- require公開なし

【High】
- sandbox: true
- CSP設定
- IPCホワイトリスト
- 入力バリデーション

【Medium】
- webviewTag無効
- will-navigate制限
- 依存関係の脆弱性

成果物:
- セキュリティ監査レポート
- 問題点と修正提案
- CSP設定ファイル（必要時）
- セキュアPreload例（必要時）
```

### Phase 3: 確認と次のステップ

**期待成果物:**
- セキュリティ監査レポート
- 修正が必要な項目リスト
- 推奨設定

**次のステップ案内:**
- 問題が見つかった場合は修正を実施
- `/ai:build-electron-app`: ビルド設定
- `/ai:release-electron-app`: 配布設定

## スコープ説明

| スコープ | 説明 | 監査内容 |
|----------|------|----------|
| full | 完全監査 | すべての項目 |
| config | 設定監査 | webPreferences、BrowserWindow |
| ipc | IPC監査 | チャネル、入力検証、Preload |
| csp | CSP監査 | Content Security Policy |
| deps | 依存関係監査 | npm audit |

## 使用例

```bash
# 完全監査を実行
/ai:secure-electron-app full

# IPC関連のみ監査
/ai:secure-electron-app ipc

# 依存関係の脆弱性のみ監査
/ai:secure-electron-app deps

# デフォルト（完全監査）
/ai:secure-electron-app
```

## セキュリティチェックリスト出力例

```
🔴 Critical
  ❌ nodeIntegration: true → false に修正必要
  ✅ contextIsolation: true

🟡 High
  ⚠️ CSP未設定 → 設定を追加
  ✅ IPCホワイトリスト実装済み

🟢 Medium
  ✅ 依存関係に重大な脆弱性なし
```

## 注意事項

- このコマンドは監査と推奨を行います
- 実際の修正はユーザーの確認後に実施します
- 本番リリース前には必ず full スコープで監査してください
