---
description: |
  ElectronアプリケーションのウィンドウとネイティブUI要素を実装する専門コマンド。

  BrowserWindow管理、メニュー、ダイアログ、通知、トレイなど
  デスクトップ特有のUI実装を行います。

  🤖 起動エージェント:
  - `.claude/agents/electron-ui-dev.md`: Electron UI実装専門エージェント

  📚 利用可能スキル（electron-ui-devエージェントが必要時に参照）:
  **必須スキル:** electron-ui-patterns, accessibility-wcag

  ⚙️ このコマンドの設定:
  - argument-hint: [window-type] - ウィンドウタイプ（main/settings/dialog/tray）
  - allowed-tools: UI実装に必要な最小権限
    • Task: electron-ui-devエージェント起動用
    • Read: 既存ファイル確認用
    • Write(src/**): UI関連ファイル生成用
    • Edit: 既存ファイル修正用
    • Grep: パターン検索用
  - model: sonnet（UI実装タスク）

  🎯 成果物:
  - src/main/window.ts: ウィンドウ管理
  - src/main/menu.ts: メニュー定義
  - src/main/tray.ts: トレイ（必要時）
  - src/renderer/components/TitleBar.tsx: カスタムタイトルバー（必要時）

  トリガーキーワード: electron, window, menu, dialog, tray, titlebar, ウィンドウ
argument-hint: "[window-type]"
allowed-tools:
  - Task
  - Read
  - Write(src/**)
  - Edit
  - Grep
  - Glob
model: sonnet
---

# Electronウィンドウ/UI作成

## 目的

`.claude/agents/electron-ui-dev.md` エージェントを起動し、ElectronアプリケーションのウィンドウとネイティブUI要素を実装します。

## エージェント起動フロー

### Phase 1: 引数確認とコンテキスト収集

```markdown
ウィンドウタイプ: "$ARGUMENTS"（main/settings/dialog/tray）

引数未指定の場合:
ユーザーに対話的に以下を質問:
- ウィンドウタイプ（メイン/設定/ダイアログ/トレイ）
- フレームスタイル（標準/カスタムタイトルバー/フレームレス）
- 必要なネイティブUI（メニュー/ダイアログ/通知/トレイ）
- ウィンドウ状態の永続化の必要性
```

### Phase 2: electron-ui-dev エージェント起動

Task ツールで `.claude/agents/electron-ui-dev.md` を起動:

```markdown
エージェント: .claude/agents/electron-ui-dev.md
ウィンドウタイプ: ${window-type}

依頼内容:
- BrowserWindow設定と管理
- アプリケーションメニュー/コンテキストメニュー（必要時）
- ダイアログ統合（必要時）
- システムトレイ（必要時）
- カスタムタイトルバー（必要時）

必須要件:
1. ウィンドウ状態の永続化
2. プラットフォーム差異の考慮
3. アクセシビリティ対応（キーボードショートカット）
4. ダークモード対応

成果物:
- src/main/window.ts
- src/main/menu.ts（必要時）
- src/main/tray.ts（必要時）
- src/renderer/components/TitleBar.tsx（必要時）
```

### Phase 3: 確認と次のステップ

**期待成果物:**
- ウィンドウ管理クラス/関数
- メニュー定義
- 必要なUI要素

**次のステップ案内:**
- `/ai:secure-electron-app`: セキュリティ強化
- `/ai:build-electron-app`: ビルド設定
- `/ai:release-electron-app`: 配布設定

## 使用例

```bash
# メインウィンドウを作成
/ai:create-electron-window main

# カスタムタイトルバー付きウィンドウを作成
/ai:create-electron-window main --frameless

# システムトレイアプリを作成
/ai:create-electron-window tray

# 対話的に作成
/ai:create-electron-window
```

## ウィンドウタイプ

| タイプ | 説明 | 特徴 |
|--------|------|------|
| main | メインウィンドウ | 状態永続化、メニュー |
| settings | 設定ウィンドウ | 小さめ、リサイズ不可 |
| dialog | ダイアログ | モーダル、小さい |
| tray | トレイアプリ | 常駐、コンテキストメニュー |

## 注意事項

- アーキテクチャ設計が先に必要な場合は `/ai:design-electron-app` を使用してください
- Renderer内のReact/Vue UIコンポーネントは `/ai:create-component` を使用してください
