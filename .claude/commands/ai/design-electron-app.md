---
description: |
  Electronデスクトップアプリケーションのアーキテクチャ設計を行う専門コマンド。

  プロセスモデル、IPC設計、セキュアなコンテキスト分離を実現し、
  保守性の高いアプリケーション構造を構築します。

  🤖 起動エージェント:
  - `.claude/agents/electron-architect.md`: Electronアーキテクチャ設計専門エージェント

  📚 利用可能スキル（electron-architectエージェントが必要時に参照）:
  **必須スキル:** electron-architecture

  ⚙️ このコマンドの設定:
  - argument-hint: [app-name] - アプリケーション名（オプション）
  - allowed-tools: アーキテクチャ設計に必要な最小権限
    • Task: electron-architectエージェント起動用
    • Read: 既存ファイル確認用
    • Write(src/**|electron-builder.yml): プロジェクト構造生成用
    • Edit: 既存ファイル修正用
    • Grep: パターン検索用
  - model: sonnet（設計タスク）

  🎯 成果物:
  - src/main/index.ts: Mainプロセスエントリーポイント
  - src/preload/index.ts: Preloadスクリプト
  - src/shared/ipc-types.ts: IPC型定義
  - src/renderer/: Rendererプロセス（UI）

  トリガーキーワード: electron, デスクトップアプリ, architecture, 設計, main process, renderer
argument-hint: "[app-name]"
allowed-tools:
  - Task
  - Read
  - Write(src/**|electron-builder.yml)
  - Edit
  - Grep
  - Glob
model: sonnet
---

# Electronアプリ アーキテクチャ設計

## 目的

`.claude/agents/electron-architect.md` エージェントを起動し、Electronアプリケーションのアーキテクチャを設計します。

## エージェント起動フロー

### Phase 1: 引数確認とコンテキスト収集

```markdown
アプリケーション名: "$ARGUMENTS"

引数未指定の場合:
ユーザーに対話的に以下を質問:
- アプリケーション名
- 主な機能・用途
- 対象プラットフォーム（macOS/Windows/Linux）
- UIフレームワーク（React/Vue/Vanilla）
```

### Phase 2: electron-architect エージェント起動

Task ツールで `.claude/agents/electron-architect.md` を起動:

```markdown
エージェント: .claude/agents/electron-architect.md
アプリケーション名: ${app-name}

依頼内容:
- Electronアプリケーションのアーキテクチャ設計
- Main/Renderer/Preloadプロセスの責務分離
- IPCチャネル設計と型定義
- セキュリティ設定（contextIsolation、sandbox）

必須要件:
1. contextIsolation: true
2. nodeIntegration: false
3. sandbox: true（推奨）
4. 型安全なIPC設計
5. Preloadでの最小限API公開

成果物:
- src/main/index.ts
- src/preload/index.ts
- src/shared/ipc-types.ts
- プロジェクトディレクトリ構造
```

### Phase 3: 確認と次のステップ

**期待成果物:**
- Mainプロセスエントリーポイント
- Preloadスクリプト
- IPC型定義
- ディレクトリ構造

**次のステップ案内:**
- `/ai:create-electron-window`: ウィンドウ/UI実装
- `/ai:secure-electron-app`: セキュリティ強化
- `/ai:build-electron-app`: ビルド設定

## 使用例

```bash
# アプリ名を指定して設計開始
/ai:design-electron-app my-desktop-app

# 対話的に設計開始
/ai:design-electron-app
```

## 注意事項

- このコマンドはアーキテクチャ設計に特化しています
- UI実装は `/ai:create-electron-window` を使用してください
- セキュリティ監査は `/ai:secure-electron-app` を使用してください
