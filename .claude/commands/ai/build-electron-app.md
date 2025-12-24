---
description: |
  Electronアプリケーションのビルド・パッケージング設定を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/electron-builder.md`: Electronビルド専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [platform]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: electron, build, package, installer, dmg, nsis, appimage
argument-hint: "[platform]"
allowed-tools:
  - Task
model: sonnet
---

# Electronビルド設定

## 目的

`.claude/commands/ai/build-electron-app.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Electronビルド専門エージェントの実行

**目的**: Electronビルド専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Electronビルド専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/electron-builder.md`

Task ツールで `.claude/agents/electron-builder.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[platform]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `scripts/notarize.js`
- `.github/workflows/build.yml`
- `scripts/sign.js`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:build-electron-app [platform]
```
