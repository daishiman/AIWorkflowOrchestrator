---
description: |
  Electronアプリケーションの配布・自動更新設定を行う専門コマンド。

  electron-updaterによる自動更新、GitHub Releases/S3配布、
  リリースチャネル管理の設定を行います。

  🤖 起動エージェント:
  - `.claude/agents/electron-release.md`: Electronリリース専門エージェント

  📚 利用可能スキル（electron-releaseエージェントが必要時に参照）:
  **必須スキル:** electron-distribution

  ⚙️ このコマンドの設定:
  - argument-hint: [action] - アクション（setup/publish/version）
  - allowed-tools: リリース設定に必要な権限
    • Task: electron-releaseエージェント起動用
    • Read: 既存ファイル確認用
    • Write: リリース関連ファイル生成用
    • Edit: 既存ファイル修正用
    • Bash: リリースコマンド実行用
  - model: sonnet（リリース設定タスク）

  🎯 成果物:
  - src/main/services/updateService.ts: 更新サービス
  - electron-builder.yml（publish設定追加）
  - .github/workflows/release.yml: リリースワークフロー
  - CHANGELOG.md

  トリガーキーワード: electron, release, update, 自動更新, 配布, publish
argument-hint: "[action]"
allowed-tools:
  - Task
  - Read
  - Write(src/**|electron-builder.yml|.github/**|CHANGELOG.md)
  - Edit
  - Grep
  - Glob
  - Bash
model: sonnet
---

# Electronリリース・配布設定

## 目的

`.claude/agents/electron-release.md` エージェントを起動し、Electronアプリケーションの配布・自動更新設定を行います。

## エージェント起動フロー

### Phase 1: 引数確認とコンテキスト収集

```markdown
アクション: "$ARGUMENTS"（setup/publish/version）

アクション説明:

- setup: 自動更新・配布の初期設定
- publish: リリース実行
- version: バージョン更新

引数未指定の場合:
ユーザーに対話的にアクションを選択
```

### Phase 2: electron-release エージェント起動

Task ツールで `.claude/agents/electron-release.md` を起動:

```markdown
エージェント: .claude/agents/electron-release.md
アクション: ${action}

【setup の場合】
依頼内容:

- electron-updater設定
- UpdateServiceクラス実装
- 配布先設定（GitHub/S3）
- リリースワークフロー作成

成果物:

- src/main/services/updateService.ts
- electron-builder.yml（publish設定）
- .github/workflows/release.yml

【publish の場合】
依頼内容:

- リリース前チェック
- CHANGELOG生成
- Gitタグ作成
- リリース実行ガイド

【version の場合】
依頼内容:

- バージョン番号更新（patch/minor/major）
- package.json更新
- CHANGELOG更新
```

### Phase 3: 確認と次のステップ

**期待成果物:**

- 自動更新サービス
- 配布設定
- リリースワークフロー

**次のステップ案内:**

- setup後: テストビルドでの動作確認
- publish準備: バージョン確認、CHANGELOG確認
- リリース: `npm run publish`

## 使用例

```bash
# 自動更新・配布の初期設定
/ai:release-electron-app setup

# リリース準備
/ai:release-electron-app publish

# バージョン更新
/ai:release-electron-app version

# 対話的に選択
/ai:release-electron-app
```

## 配布オプション

| 配布先          | 特徴               | 推奨ケース       |
| --------------- | ------------------ | ---------------- |
| GitHub Releases | 無料、簡単         | OSS、小規模      |
| S3/CloudFront   | 高速、スケーラブル | 中〜大規模       |
| 自前サーバー    | 完全制御           | エンタープライズ |

## リリースチャネル

| チャネル | バージョン形式 | 対象       |
| -------- | -------------- | ---------- |
| stable   | 1.0.0          | 全ユーザー |
| beta     | 1.1.0-beta.1   | テスター   |
| alpha    | 2.0.0-alpha.1  | 開発者     |

## 自動更新フロー

```
1. アプリ起動
   ↓
2. checkForUpdates()
   ↓
3. update-available イベント
   ↓
4. ユーザー確認 → downloadUpdate()
   ↓
5. download-progress イベント
   ↓
6. update-downloaded イベント
   ↓
7. ユーザー確認 → quitAndInstall()
```

## 注意事項

- 自動更新には署名済みビルドが必要です
- GitHub Releasesを使用する場合はGH_TOKENが必要です
- ベータ/アルファチャネルにはprereleaseタグを使用します
