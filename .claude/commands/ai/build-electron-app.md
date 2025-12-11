---
description: |
  Electronアプリケーションのビルド・パッケージング設定を行う専門コマンド。

  electron-builder設定、コード署名、アイコン生成、各プラットフォーム向け
  インストーラー作成の設定を行います。

  🤖 起動エージェント:
  - `.claude/agents/electron-builder.md`: Electronビルド専門エージェント

  📚 利用可能スキル（electron-builderエージェントが必要時に参照）:
  **必須スキル:** electron-packaging

  ⚙️ このコマンドの設定:
  - argument-hint: [platform] - 対象プラットフォーム（mac/win/linux/all）
  - allowed-tools: ビルド設定に必要な権限
    • Task: electron-builderエージェント起動用
    • Read: 既存ファイル確認用
    • Write: ビルド設定ファイル生成用
    • Edit: 既存ファイル修正用
    • Bash: ビルドコマンド実行用
  - model: sonnet（ビルド設定タスク）

  🎯 成果物:
  - electron-builder.yml: ビルド設定
  - build/entitlements.mac.plist: macOSエンタイトルメント
  - scripts/notarize.js: Notarization設定
  - .github/workflows/build.yml: CI/CDワークフロー

  トリガーキーワード: electron, build, package, installer, dmg, nsis, appimage
argument-hint: "[platform]"
allowed-tools:
  - Task
  - Read
  - Write(electron-builder.yml|build/**|scripts/**|.github/**)
  - Edit
  - Grep
  - Glob
  - Bash
model: sonnet
---

# Electronビルド設定

## 目的

`.claude/agents/electron-builder.md` エージェントを起動し、Electronアプリケーションのビルド・パッケージング設定を行います。

## エージェント起動フロー

### Phase 1: 引数確認とコンテキスト収集

```markdown
対象プラットフォーム: "$ARGUMENTS"（mac/win/linux/all）

引数未指定の場合:
ユーザーに対話的に以下を質問:

- 対象プラットフォーム（複数選択可）
- コード署名の必要性
- 配布方法（直接配布/ストア）
- CI/CD統合の必要性
```

### Phase 2: electron-builder エージェント起動

Task ツールで `.claude/agents/electron-builder.md` を起動:

```markdown
エージェント: .claude/agents/electron-builder.md
対象プラットフォーム: ${platform}

依頼内容:

- electron-builder.yml作成/更新
- プラットフォーム固有設定
- コード署名設定（必要時）
- アイコン設定
- CI/CDワークフロー（必要時）

プラットフォーム別設定:
【macOS】

- DMG/ZIP生成
- コード署名（Developer ID）
- Notarization
- エンタイトルメント

【Windows】

- NSIS/Portable生成
- コード署名（Authenticode）
- アイコン設定

【Linux】

- AppImage/deb/rpm生成
- デスクトップエントリ

成果物:

- electron-builder.yml
- build/entitlements.mac.plist（macOS）
- scripts/notarize.js（macOS）
- scripts/sign.js（Windows）
- .github/workflows/build.yml（CI/CD）
```

### Phase 3: 確認と次のステップ

**期待成果物:**

- electron-builder設定
- プラットフォーム固有ファイル
- CI/CDワークフロー（オプション）

**次のステップ案内:**

- `npm run package` でローカルビルド
- `/ai:release-electron-app`: 配布・自動更新設定
- コード署名環境変数の設定

## 使用例

```bash
# macOS用ビルド設定
/ai:build-electron-app mac

# Windows用ビルド設定
/ai:build-electron-app win

# 全プラットフォーム設定
/ai:build-electron-app all

# 対話的に設定
/ai:build-electron-app
```

## 環境変数ガイド

### macOS署名

```bash
APPLE_ID=your@email.com
APPLE_ID_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=XXXXXXXXXX
CSC_LINK=base64-encoded-p12
CSC_KEY_PASSWORD=certificate-password
```

### Windows署名

```bash
WIN_CERT_FILE=./certificate.pfx
WIN_CERT_PASSWORD=your-password
```

## 注意事項

- コード署名には有効な証明書が必要です
- macOSのNotarizationにはApple Developer Programの登録が必要です
- CI/CDでのビルドにはシークレットの設定が必要です
