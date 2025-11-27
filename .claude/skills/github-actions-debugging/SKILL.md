---
name: github-actions-debugging
description: |
  GitHub Actionsワークフロー実行時のデバッグとトラブルシューティング。

  **自動発動条件**:
  - GitHub Actionsのエラーログ分析が必要な時
  - ワークフロー実行の失敗原因を特定する時
  - デバッグログを有効化する必要がある時
  - シークレット、権限、キャッシュの問題をトラブルシュートする時
  - ランナー環境の問題を診断する時

  **主要キーワード**: debug, troubleshoot, error, failed workflow, ACTIONS_STEP_DEBUG, workflow logs, permission denied, cache miss
version: 1.0.0
dependencies:
  - github-actions-syntax
related_skills:
  - .claude/skills/github-actions-syntax/SKILL.md
  - .claude/skills/workflow-security/SKILL.md
  - .claude/skills/github-api-integration/SKILL.md
---

# GitHub Actions Debugging Skill

GitHub Actionsワークフローの実行エラー診断、デバッグログ有効化、トラブルシューティングの専門知識を提供します。

## スキルの目的

1. **デバッグログ有効化**: ACTIONS_STEP_DEBUG、ACTIONS_RUNNER_DEBUGの設定
2. **エラー診断**: 一般的なエラーパターンの特定と解決
3. **診断コマンド**: コンテキスト検査、環境ダンプ、ランナー情報取得
4. **トラブルシューティング**: 権限、シークレット、キャッシュ、タイムアウト問題の解決
5. **ログ分析**: ワークフロー実行ログの効率的な分析

## ディレクトリ構造

```
.claude/skills/github-actions-debugging/
├── SKILL.md                           # このファイル
├── resources/
│   ├── debug-logging.md               # デバッグログ有効化ガイド
│   ├── troubleshooting-guide.md       # 一般的なエラーと解決策
│   └── diagnostic-commands.md         # 診断用コマンドリファレンス
├── templates/
│   └── debug-workflow.yaml            # デバッグ有効化ワークフロー
└── scripts/
    └── analyze-logs.mjs               # ログ分析スクリプト
```

## コマンドリファレンス

### リソース参照

```bash
# デバッグログ有効化の詳細
cat .claude/skills/github-actions-debugging/resources/debug-logging.md

# 一般的なエラーのトラブルシューティング
cat .claude/skills/github-actions-debugging/resources/troubleshooting-guide.md

# 診断コマンドリファレンス
cat .claude/skills/github-actions-debugging/resources/diagnostic-commands.md
```

### テンプレートとスクリプト

```bash
# デバッグ有効化ワークフローテンプレート
cat .claude/skills/github-actions-debugging/templates/debug-workflow.yaml

# ワークフローログの分析
node .claude/skills/github-actions-debugging/scripts/analyze-logs.mjs <log-file>
```

## クイックリファレンス

### デバッグログ有効化

| 方法 | スコープ | 用途 |
|------|---------|------|
| **ACTIONS_STEP_DEBUG** | リポジトリシークレット | ステップ実行の詳細ログ |
| **ACTIONS_RUNNER_DEBUG** | リポジトリシークレット | ランナープロセスの診断ログ |
| **debug()** | ワークフロー内 | カスタムデバッグメッセージ |

### よくあるエラーパターン

| エラー | 原因 | 解決策リソース |
|--------|------|---------------|
| **Permission denied** | GITHUB_TOKEN権限不足 | troubleshooting-guide.md §1 |
| **Cache miss** | キャッシュキー不一致 | troubleshooting-guide.md §2 |
| **Timeout** | ジョブ実行時間超過 | troubleshooting-guide.md §3 |
| **Secret not found** | シークレット未設定 | troubleshooting-guide.md §4 |
| **Runner out of disk** | ディスク容量不足 | diagnostic-commands.md §3 |

## 診断フェーズ

### Phase 1: エラー特定
```bash
# ログからエラーパターンを抽出
node .claude/skills/github-actions-debugging/scripts/analyze-logs.mjs workflow.log
```

### Phase 2: デバッグログ有効化
```yaml
# リポジトリシークレットに設定
ACTIONS_STEP_DEBUG: true
ACTIONS_RUNNER_DEBUG: true
```

### Phase 3: コンテキスト検査
```yaml
- name: Dump GitHub context
  run: echo '${{ toJSON(github) }}'
```

### Phase 4: 環境診断
```yaml
- name: Check runner environment
  run: |
    echo "OS: $RUNNER_OS"
    df -h
    env | sort
```

## 基本的なデバッグワークフロー

```yaml
name: Debug Workflow
on: [push]

jobs:
  debug:
    runs-on: ubuntu-latest
    steps:
      - name: Enable debug logging
        run: echo "::debug::Debug logging enabled"

      - name: Dump contexts
        run: |
          echo "GitHub: ${{ toJSON(github) }}"
          echo "Env: ${{ toJSON(env) }}"
```

詳細は `templates/debug-workflow.yaml` を参照してください。

## 使用パターン

### パターン1: エラーログ分析
```bash
# 1. ワークフローログをダウンロード
gh run view <run-id> --log > workflow.log

# 2. ログを分析
node .claude/skills/github-actions-debugging/scripts/analyze-logs.mjs workflow.log

# 3. トラブルシューティングガイドを参照
cat .claude/skills/github-actions-debugging/resources/troubleshooting-guide.md
```

### パターン2: デバッグログ有効化
```bash
# 1. リポジトリシークレットを設定
gh secret set ACTIONS_STEP_DEBUG --body "true"

# 2. ワークフローを再実行
gh run rerun <run-id> --debug
```

## 関連スキル

- **github-actions-syntax** (`.claude/skills/github-actions-syntax/SKILL.md`): ワークフロー構文の基礎
- **workflow-security** (`.claude/skills/workflow-security/SKILL.md`): 権限とシークレット管理
- **github-api-integration** (`.claude/skills/github-api-integration/SKILL.md`): GitHub APIでのワークフロー操作

## ベストプラクティス

1. **段階的デバッグ**: ACTIONS_STEP_DEBUG → カスタムログ → ACTIONS_RUNNER_DEBUG
2. **コンテキスト検査**: エラー時は常にgithub、env、jobコンテキストをダンプ
3. **ログ分析**: スクリプトを使用して効率的にエラーパターンを抽出
4. **環境再現**: ローカルで `act` を使用してワークフローをテスト
5. **権限最小化**: デバッグ後はACTIONS_*_DEBUGシークレットを削除

---

**このスキルの使い方**:
1. エラーが発生したら `troubleshooting-guide.md` でパターンを検索
2. デバッグログが必要なら `debug-logging.md` を参照
3. 環境診断が必要なら `diagnostic-commands.md` を参照
4. テンプレートをベースにデバッグワークフローを作成
