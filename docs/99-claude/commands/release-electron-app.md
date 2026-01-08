---
description: |
  Electronアプリケーションの配布・自動更新設定を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/electron-release.md`: Electronリリース専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [action]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: electron, release, update, 自動更新, 配布, publish
argument-hint: "[action]"
allowed-tools:
  - Task
model: sonnet
---

# Electronリリース・配布設定

## 目的

`.claude/commands/ai/release-electron-app.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Electronリリース専門エージェントの実行

**目的**: Electronリリース専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Electronリリース専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/electron-release.md`

Task ツールで `.claude/agents/electron-release.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[action]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/main/services/updateService.ts`
- `.github/workflows/release.yml`
- `package.json`
- `CHANGELOG.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:release-electron-app [action]
```
