# GitHub Actions デバッグログ有効化ガイド

GitHub Actionsワークフローのデバッグログを有効化し、詳細な実行情報を取得する方法を説明します。

## 1. デバッグログの種類

### 1.1 ACTIONS_STEP_DEBUG

**用途**: 各ステップの詳細な実行ログを出力

**有効化方法**:
```bash
# リポジトリシークレットとして設定
gh secret set ACTIONS_STEP_DEBUG --body "true"
```

**または手動設定**:
1. GitHubリポジトリ → Settings → Secrets and variables → Actions
2. "New repository secret" をクリック
3. Name: `ACTIONS_STEP_DEBUG`
4. Value: `true`

**出力例**:
```
::debug::Evaluating condition for step: 'Run tests'
::debug::Evaluating: success()
::debug::Evaluating success:
::debug::=> true
::debug::Result: true
```

### 1.2 ACTIONS_RUNNER_DEBUG

**用途**: ランナープロセスの診断ログを出力（より詳細）

**有効化方法**:
```bash
gh secret set ACTIONS_RUNNER_DEBUG --body "true"
```

**警告**:
- 非常に大量のログを生成
- ストレージとログビューアのパフォーマンスに影響
- 本当に必要な場合のみ使用

**出力例**:
```
[DEBUG] Starting runner listener
[DEBUG] Connection info: https://pipelines.actions.githubusercontent.com/...
[DEBUG] Acquiring job...
[DEBUG] Downloaded action: actions/checkout@v4
```

### 1.3 カスタムデバッグメッセージ

**ワークフロー内でのデバッグ出力**:

```yaml
- name: Debug output
  run: |
    echo "::debug::Variable value: ${{ vars.MY_VAR }}"
    echo "::debug::Current directory: $(pwd)"
    echo "::debug::Environment: $RUNNER_OS"
```

**ログレベル**:
```yaml
- name: Various log levels
  run: |
    echo "::debug::Debug message (only visible with ACTIONS_STEP_DEBUG)"
    echo "::notice::Notice message (always visible, blue)"
    echo "::warning::Warning message (always visible, yellow)"
    echo "::error::Error message (always visible, red)"
```

## 2. コンテキスト検査

### 2.1 GitHub コンテキスト

```yaml
- name: Dump GitHub context
  run: echo '${{ toJSON(github) }}'
```

**主要フィールド**:
- `github.event`: トリガーイベントの詳細
- `github.ref`: ブランチ/タグ参照
- `github.sha`: コミットSHA
- `github.actor`: ワークフローを実行したユーザー
- `github.repository`: リポジトリ名

### 2.2 Env コンテキスト

```yaml
- name: Dump env context
  run: echo '${{ toJSON(env) }}'
```

### 2.3 Job コンテキスト

```yaml
- name: Dump job context
  run: echo '${{ toJSON(job) }}'
```

### 2.4 Steps コンテキスト

```yaml
- name: Run step
  id: my-step
  run: echo "result=success" >> $GITHUB_OUTPUT

- name: Check step output
  run: echo '${{ toJSON(steps.my-step) }}'
```

### 2.5 Runner コンテキスト

```yaml
- name: Dump runner context
  run: echo '${{ toJSON(runner) }}'
```

## 3. ステップ間データ検査

### 3.1 GITHUB_OUTPUT の使用

```yaml
- name: Set output
  id: data
  run: |
    echo "timestamp=$(date +%s)" >> $GITHUB_OUTPUT
    echo "status=success" >> $GITHUB_OUTPUT

- name: Debug output
  run: |
    echo "::debug::Timestamp: ${{ steps.data.outputs.timestamp }}"
    echo "::debug::Status: ${{ steps.data.outputs.status }}"
```

### 3.2 環境変数の検査

```yaml
- name: Set env var
  run: echo "MY_VAR=value" >> $GITHUB_ENV

- name: Debug env var
  run: echo "::debug::MY_VAR=$MY_VAR"
```

### 3.3 アーティファクトを使ったデバッグ

```yaml
- name: Save debug info
  run: |
    env > debug-env.txt
    cat $GITHUB_EVENT_PATH > debug-event.json
    df -h > debug-disk.txt

- name: Upload debug artifacts
  uses: actions/upload-artifact@v4
  with:
    name: debug-info
    path: debug-*.txt
```

## 4. 条件付きデバッグ

### 4.1 デバッグモード検出

```yaml
- name: Conditional debug
  if: ${{ secrets.ACTIONS_STEP_DEBUG == 'true' }}
  run: |
    echo "Running in debug mode"
    ls -la
    env | sort
    cat /etc/os-release
```

### 4.2 失敗時のデバッグ

```yaml
- name: Run tests
  id: test
  run: npm test
  continue-on-error: true

- name: Debug on failure
  if: failure()
  run: |
    echo "::debug::Test failed with status: ${{ steps.test.outcome }}"
    cat test-output.log
    env
```

## 5. ランナー環境デバッグ

### 5.1 システム情報

```yaml
- name: System info
  run: |
    echo "::group::OS Information"
    cat /etc/os-release
    uname -a
    echo "::endgroup::"

    echo "::group::Disk Space"
    df -h
    echo "::endgroup::"

    echo "::group::Memory"
    free -h
    echo "::endgroup::"

    echo "::group::CPU"
    lscpu
    echo "::endgroup::"
```

### 5.2 インストール済みツール

```yaml
- name: Check installed tools
  run: |
    echo "::group::Node.js"
    node --version
    npm --version
    echo "::endgroup::"

    echo "::group::Docker"
    docker --version
    docker-compose --version
    echo "::endgroup::"

    echo "::group::Git"
    git --version
    echo "::endgroup::"
```

### 5.3 ネットワーク診断

```yaml
- name: Network diagnostics
  run: |
    echo "::group::Network Interfaces"
    ip addr show
    echo "::endgroup::"

    echo "::group::DNS"
    cat /etc/resolv.conf
    echo "::endgroup::"

    echo "::group::Connectivity"
    ping -c 3 github.com || true
    curl -I https://github.com
    echo "::endgroup::"
```

## 6. デバッグログのベストプラクティス

### 6.1 段階的デバッグ

```
Phase 1: 基本デバッグ
├─ カスタムecho/printでステップ進行確認
└─ 失敗したステップ周辺に集中

Phase 2: ACTIONS_STEP_DEBUG
├─ リポジトリシークレットに設定
└─ ステップ実行の詳細を確認

Phase 3: ACTIONS_RUNNER_DEBUG
├─ 本当に必要な場合のみ
└─ ランナープロセスの診断
```

### 6.2 ログの構造化

```yaml
- name: Structured logging
  run: |
    echo "::group::Environment Variables"
    env | grep GITHUB_ | sort
    echo "::endgroup::"

    echo "::group::Working Directory"
    pwd
    ls -la
    echo "::endgroup::"

    echo "::group::Dependencies"
    cat package.json
    echo "::endgroup::"
```

### 6.3 デバッグ後のクリーンアップ

```bash
# デバッグ完了後、シークレットを削除
gh secret remove ACTIONS_STEP_DEBUG
gh secret remove ACTIONS_RUNNER_DEBUG
```

## 7. ローカルデバッグ

### 7.1 act を使用したローカル実行

```bash
# インストール
brew install act

# ワークフローをローカルで実行
act push

# 特定のジョブを実行
act -j test

# デバッグモード
act push -v
```

### 7.2 act でのシークレット設定

```bash
# .secretsファイルを作成
ACTIONS_STEP_DEBUG=true
ACTIONS_RUNNER_DEBUG=true
MY_SECRET=secret_value

# actで使用
act push --secret-file .secrets
```

## 8. トラブルシューティング Tips

### 8.1 デバッグログが表示されない

**原因**: ACTIONS_STEP_DEBUGがリポジトリシークレットに設定されていない

**解決策**:
```bash
gh secret set ACTIONS_STEP_DEBUG --body "true"
```

### 8.2 ログが多すぎて見づらい

**解決策**: ログをグループ化
```yaml
- name: Verbose output
  run: |
    echo "::group::Detailed logs"
    # 大量のログ出力
    echo "::endgroup::"
```

### 8.3 センシティブ情報の漏洩

**解決策**: 自動マスキングの確認
```yaml
- name: Check masking
  run: |
    # シークレットは自動的にマスクされる
    echo "Secret: ${{ secrets.MY_SECRET }}"
    # 出力: Secret: ***
```

**追加マスク**:
```yaml
- name: Mask custom values
  run: |
    echo "::add-mask::$MY_SENSITIVE_VALUE"
    echo "Value: $MY_SENSITIVE_VALUE"  # マスクされる
```

---

**関連リソース**:
- [troubleshooting-guide.md](./troubleshooting-guide.md): 一般的なエラーと解決策
- [diagnostic-commands.md](./diagnostic-commands.md): 診断コマンドリファレンス
