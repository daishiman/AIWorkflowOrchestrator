# GitHub Actions 診断コマンドリファレンス

ワークフロー実行時の環境情報、システム状態、ネットワーク診断などに使用できるコマンド集です。

## 1. コンテキスト検査コマンド

### 1.1 GitHub コンテキスト

```yaml
- name: GitHub コンテキスト全体
  run: echo '${{ toJSON(github) }}'

- name: イベント情報
  run: echo '${{ toJSON(github.event) }}'

- name: 基本情報
  run: |
    echo "Repository: ${{ github.repository }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    echo "Actor: ${{ github.actor }}"
    echo "Event name: ${{ github.event_name }}"
    echo "Run ID: ${{ github.run_id }}"
    echo "Run number: ${{ github.run_number }}"
```

### 1.2 Job コンテキスト

```yaml
- name: Job コンテキスト
  run: echo '${{ toJSON(job) }}'

- name: Job ステータス
  run: |
    echo "Job status: ${{ job.status }}"
    echo "Job container: ${{ job.container }}"
```

### 1.3 Steps コンテキスト

```yaml
- name: Run step
  id: my-step
  run: |
    echo "result=success" >> $GITHUB_OUTPUT
    echo "timestamp=$(date +%s)" >> $GITHUB_OUTPUT

- name: Steps コンテキスト
  run: |
    echo '${{ toJSON(steps) }}'
    echo "My step outcome: ${{ steps.my-step.outcome }}"
    echo "My step conclusion: ${{ steps.my-step.conclusion }}"
    echo "My step output: ${{ steps.my-step.outputs.result }}"
```

### 1.4 Runner コンテキスト

```yaml
- name: Runner コンテキスト
  run: |
    echo '${{ toJSON(runner) }}'
    echo "OS: ${{ runner.os }}"
    echo "Arch: ${{ runner.arch }}"
    echo "Name: ${{ runner.name }}"
    echo "Temp: ${{ runner.temp }}"
    echo "Tool cache: ${{ runner.tool_cache }}"
```

### 1.5 Env コンテキスト

```yaml
- name: Env コンテキスト
  run: echo '${{ toJSON(env) }}'

- name: 全環境変数
  run: env | sort
```

## 2. システム情報コマンド

### 2.1 OS 情報

```yaml
- name: OS Information
  run: |
    echo "::group::OS Details"
    if [ -f /etc/os-release ]; then
      cat /etc/os-release
    fi
    uname -a
    echo "::endgroup::"

    echo "::group::Kernel"
    uname -r
    echo "::endgroup::"
```

### 2.2 CPU 情報

```yaml
- name: CPU Information
  run: |
    echo "::group::CPU Details"
    lscpu
    echo "::endgroup::"

    echo "::group::CPU Count"
    nproc
    echo "::endgroup::"

    echo "::group::Load Average"
    uptime
    echo "::endgroup::"
```

### 2.3 メモリ情報

```yaml
- name: Memory Information
  run: |
    echo "::group::Memory Details"
    free -h
    echo "::endgroup::"

    echo "::group::Memory Breakdown"
    cat /proc/meminfo | grep -E "MemTotal|MemFree|MemAvailable|Cached|SwapTotal|SwapFree"
    echo "::endgroup::"
```

### 2.4 ディスク情報

```yaml
- name: Disk Information
  run: |
    echo "::group::Disk Usage"
    df -h
    echo "::endgroup::"

    echo "::group::Inode Usage"
    df -i
    echo "::endgroup::"

    echo "::group::Disk I/O"
    iostat -x 1 3 || echo "iostat not available"
    echo "::endgroup::"
```

### 2.5 プロセス情報

```yaml
- name: Process Information
  run: |
    echo "::group::Top Processes"
    ps aux --sort=-%mem | head -20
    echo "::endgroup::"

    echo "::group::Process Tree"
    pstree -p || ps -ejH
    echo "::endgroup::"
```

## 3. インストール済みツール検査

### 3.1 言語ランタイム

```yaml
- name: Language Runtimes
  run: |
    echo "::group::Node.js"
    node --version || echo "Node.js not found"
    pnpm --version || echo "pnpm not found"
    echo "::endgroup::"

    echo "::group::Python"
    python --version || echo "Python not found"
    python3 --version || echo "Python3 not found"
    pip --version || echo "pip not found"
    echo "::endgroup::"

    echo "::group::Ruby"
    ruby --version || echo "Ruby not found"
    gem --version || echo "gem not found"
    echo "::endgroup::"

    echo "::group::Go"
    go version || echo "Go not found"
    echo "::endgroup::"

    echo "::group::Java"
    java -version || echo "Java not found"
    javac -version || echo "javac not found"
    echo "::endgroup::"
```

### 3.2 ビルドツール

```yaml
- name: Build Tools
  run: |
    echo "::group::Make"
    make --version || echo "make not found"
    echo "::endgroup::"

    echo "::group::CMake"
    cmake --version || echo "cmake not found"
    echo "::endgroup::"

    echo "::group::Gradle"
    gradle --version || echo "gradle not found"
    echo "::endgroup::"

    echo "::group::Maven"
    mvn --version || echo "maven not found"
    echo "::endgroup::"
```

### 3.3 コンテナツール

```yaml
- name: Container Tools
  run: |
    echo "::group::Docker"
    docker --version || echo "docker not found"
    docker info || echo "docker daemon not running"
    echo "::endgroup::"

    echo "::group::Docker Compose"
    docker-compose --version || echo "docker-compose not found"
    echo "::endgroup::"

    echo "::group::Podman"
    podman --version || echo "podman not found"
    echo "::endgroup::"
```

### 3.4 バージョン管理

```yaml
- name: Version Control
  run: |
    echo "::group::Git"
    git --version
    git config --list
    echo "::endgroup::"

    echo "::group::Git LFS"
    git-lfs --version || echo "git-lfs not found"
    echo "::endgroup::"
```

## 4. ネットワーク診断

### 4.1 ネットワークインターフェース

```yaml
- name: Network Interfaces
  run: |
    echo "::group::IP Addresses"
    ip addr show || ifconfig
    echo "::endgroup::"

    echo "::group::Routing Table"
    ip route || route -n
    echo "::endgroup::"
```

### 4.2 DNS 設定

```yaml
- name: DNS Configuration
  run: |
    echo "::group::Resolv.conf"
    cat /etc/resolv.conf
    echo "::endgroup::"

    echo "::group::DNS Lookup"
    nslookup github.com || echo "nslookup not available"
    dig github.com || echo "dig not available"
    echo "::endgroup::"
```

### 4.3 接続テスト

```yaml
- name: Connectivity Tests
  run: |
    echo "::group::Ping Test"
    ping -c 3 github.com || echo "ping failed"
    ping -c 3 8.8.8.8 || echo "ping to 8.8.8.8 failed"
    echo "::endgroup::"

    echo "::group::HTTP Test"
    curl -I https://github.com
    curl -I https://api.github.com
    echo "::endgroup::"

    echo "::group::Traceroute"
    traceroute github.com || echo "traceroute not available"
    echo "::endgroup::"
```

### 4.4 ポート確認

```yaml
- name: Port Check
  run: |
    echo "::group::Listening Ports"
    netstat -tuln || ss -tuln
    echo "::endgroup::"

    echo "::group::Open Connections"
    netstat -ant | grep ESTABLISHED || ss -ant | grep ESTAB
    echo "::endgroup::"
```

## 5. ファイルシステム診断

### 5.1 ディレクトリ構造

```yaml
- name: Directory Structure
  run: |
    echo "::group::Workspace"
    pwd
    ls -la
    echo "::endgroup::"

    echo "::group::Home Directory"
    ls -la ~
    echo "::endgroup::"

    echo "::group::Temp Directory"
    ls -la ${{ runner.temp }}
    echo "::endgroup::"
```

### 5.2 ファイル検索

```yaml
- name: Find Large Files
  run: |
    echo "::group::Top 20 Largest Files"
    find . -type f -exec du -h {} + | sort -rh | head -20
    echo "::endgroup::"

    echo "::group::Recently Modified"
    find . -type f -mtime -1 -ls | head -20
    echo "::endgroup::"
```

### 5.3 パーミッション確認

```yaml
- name: Permission Check
  run: |
    echo "::group::Current Permissions"
    ls -la
    echo "::endgroup::"

    echo "::group::Executable Files"
    find . -type f -executable -ls
    echo "::endgroup::"
```

## 6. GitHub API 診断

### 6.1 レート制限確認

```yaml
- name: Check Rate Limit
  run: |
    curl -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
         https://api.github.com/rate_limit
```

### 6.2 リポジトリ情報

```yaml
- name: Repository Info
  run: |
    curl -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
         https://api.github.com/repos/${{ github.repository }}
```

### 6.3 ワークフロー実行情報

```yaml
- name: Workflow Run Info
  run: |
    curl -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
         https://api.github.com/repos/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

## 7. キャッシュ診断

### 7.1 キャッシュディレクトリ確認

```yaml
- name: Check Cache Directories
  run: |
    echo "::group::pnpm cache"
    pnpm cache verify
    du -sh ~/.pnpm
    echo "::endgroup::"

    echo "::group::pip cache"
    pip cache info || echo "pip cache not available"
    du -sh ~/.cache/pip || echo "pip cache dir not found"
    echo "::endgroup::"

    echo "::group::Cargo cache"
    du -sh ~/.cargo || echo "cargo cache not found"
    echo "::endgroup::"
```

### 7.2 キャッシュキー検証

```yaml
- name: Verify Cache Keys
  run: |
    echo "Current OS: ${{ runner.os }}"
    echo "Package lock hash: ${{ hashFiles('**/package-lock.json') }}"
    echo "Cargo lock hash: ${{ hashFiles('**/Cargo.lock') }}"
    echo "Poetry lock hash: ${{ hashFiles('**/poetry.lock') }}"
```

## 8. 環境変数診断

### 8.1 GitHub 固有の環境変数

```yaml
- name: GitHub Environment Variables
  run: |
    echo "::group::GitHub Variables"
    env | grep GITHUB_ | sort
    echo "::endgroup::"

    echo "::group::Runner Variables"
    env | grep RUNNER_ | sort
    echo "::endgroup::"
```

### 8.2 カスタム環境変数

```yaml
- name: Custom Environment Variables
  env:
    MY_VAR: test_value
  run: |
    echo "::group::All Environment Variables"
    env | sort
    echo "::endgroup::"

    echo "::group::PATH"
    echo "$PATH" | tr ':' '\n'
    echo "::endgroup::"
```

## 9. セキュリティ診断

### 9.1 シークレットマスキング確認

```yaml
- name: Test Secret Masking
  run: |
    # シークレットは自動的にマスクされる
    echo "Token: ${{ secrets.GITHUB_TOKEN }}"
    # 出力: Token: ***

    # 追加マスク
    echo "::add-mask::$MY_SENSITIVE_VALUE"
    echo "Value: $MY_SENSITIVE_VALUE"  # マスクされる
```

### 9.2 権限確認

```yaml
- name: Check Permissions
  run: |
    echo "::group::Token Permissions"
    curl -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
         https://api.github.com/user
    echo "::endgroup::"

    echo "::group::File Permissions"
    ls -la ~/.ssh 2>/dev/null || echo "No .ssh directory"
    echo "::endgroup::"
```

## 10. パフォーマンス診断

### 10.1 タイミング測定

```yaml
- name: Performance Measurement
  run: |
    echo "::group::Build Time"
    time pnpm run build
    echo "::endgroup::"

    echo "::group::Test Time"
    time pnpm test
    echo "::endgroup::"
```

### 10.2 リソース使用量

```yaml
- name: Resource Usage
  run: |
    echo "::group::Before Task"
    free -h
    df -h
    echo "::endgroup::"

    # タスク実行
    pnpm run build

    echo "::group::After Task"
    free -h
    df -h
    echo "::endgroup::"
```

## 11. デバッグヘルパー関数

### 11.1 包括的診断スクリプト

```yaml
- name: Comprehensive Diagnostics
  run: |
    cat << 'EOF' > diagnostics.sh
    #!/bin/bash
    set -e

    echo "::group::System Info"
    uname -a
    cat /etc/os-release
    echo "::endgroup::"

    echo "::group::Resources"
    free -h
    df -h
    echo "::endgroup::"

    echo "::group::Network"
    ip addr show || ifconfig
    ping -c 3 github.com || true
    echo "::endgroup::"

    echo "::group::Tools"
    node --version || echo "Node.js not found"
    python --version || echo "Python not found"
    docker --version || echo "Docker not found"
    echo "::endgroup::"

    echo "::group::Environment"
    env | grep -E "GITHUB_|RUNNER_" | sort
    echo "::endgroup::"
    EOF

    chmod +x diagnostics.sh
    ./diagnostics.sh
```

### 11.2 エラー時の自動診断

```yaml
- name: Run task
  id: task
  run: pnpm run build
  continue-on-error: true

- name: Diagnostic on failure
  if: failure()
  run: |
    echo "::group::Task Status"
    echo "Outcome: ${{ steps.task.outcome }}"
    echo "Conclusion: ${{ steps.task.conclusion }}"
    echo "::endgroup::"

    echo "::group::System State"
    df -h
    free -h
    ps aux --sort=-%mem | head -10
    echo "::endgroup::"

    echo "::group::Recent Logs"
    tail -100 build.log 2>/dev/null || echo "No build log"
    echo "::endgroup::"
```

---

**関連リソース**:
- [debug-logging.md](./debug-logging.md): デバッグログ有効化ガイド
- [troubleshooting-guide.md](./troubleshooting-guide.md): 一般的なエラーと解決策
