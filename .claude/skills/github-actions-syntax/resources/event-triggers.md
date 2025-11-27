# GitHub Actions イベントトリガー詳細

## pushイベント

```yaml
on:
  push:
    branches:
      - main
      - 'releases/**'
    branches-ignore:
      - 'feature/**'
    paths:
      - 'src/**'
      - '!src/docs/**'
    paths-ignore:
      - '**/*.md'
    tags:
      - v*.*.*
    tags-ignore:
      - v*-beta*
```

## pull_requestイベント

```yaml
on:
  pull_request:
    branches: [main, develop]
    types:
      - opened
      - synchronize
      - reopened
      - ready_for_review
    paths:
      - 'src/**'
```

### pull_requestのtypes

| type | 説明 |
|------|------|
| `opened` | PR作成時 |
| `synchronize` | 新しいコミットプッシュ時 |
| `reopened` | PR再オープン時 |
| `closed` | PRクローズ時 |
| `ready_for_review` | draft解除時 |
| `labeled` | ラベル追加時 |
| `unlabeled` | ラベル削除時 |

## workflow_dispatchイベント

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'デプロイ先環境'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      debug:
        description: 'デバッグモード'
        required: false
        type: boolean
        default: false
      version:
        description: 'バージョン'
        required: true
        type: string
```

### inputsの型

- `string`: 文字列
- `boolean`: 真偽値
- `choice`: 選択肢
- `environment`: 環境

## scheduleイベント

```yaml
on:
  schedule:
    # 毎日 UTC 0:00
    - cron: '0 0 * * *'
    # 月曜日 9:00 JST (0:00 UTC)
    - cron: '0 0 * * MON'
    # 毎月1日 0:00
    - cron: '0 0 1 * *'
```

### cron構文

```
┌───────────── 分 (0 - 59)
│ ┌───────────── 時 (0 - 23)
│ │ ┌───────────── 日 (1 - 31)
│ │ │ ┌───────────── 月 (1 - 12)
│ │ │ │ ┌───────────── 曜日 (0 - 6, 0=日曜)
│ │ │ │ │
* * * * *
```

## workflow_callイベント

```yaml
on:
  workflow_call:
    inputs:
      config-path:
        required: true
        type: string
      environment:
        required: false
        type: string
        default: 'staging'
    outputs:
      artifact-id:
        description: 'アーティファクトID'
        value: ${{ jobs.build.outputs.artifact-id }}
    secrets:
      deploy-token:
        required: true
      api-key:
        required: false
```

## releaseイベント

```yaml
on:
  release:
    types:
      - published
      - created
      - released
      - prereleased
```

## その他のイベント

### issuesイベント

```yaml
on:
  issues:
    types: [opened, labeled, assigned]
```

### issue_commentイベント

```yaml
on:
  issue_comment:
    types: [created]
```

### pull_request_targetイベント

```yaml
# 注意: フォークからのPRでも書き込み権限が付与される
on:
  pull_request_target:
    types: [opened, synchronize]
```

### repository_dispatchイベント

```yaml
on:
  repository_dispatch:
    types: [deploy, test]
```

## フィルタパターン

### ブランチフィルタ

```yaml
# 含める
branches:
  - main
  - 'feature/**'
  - 'release/v[0-9]+.[0-9]+'

# 除外
branches-ignore:
  - 'dependabot/**'
```

### パスフィルタ

```yaml
# 含める
paths:
  - 'src/**'
  - '*.js'

# 除外（!で否定）
paths:
  - 'src/**'
  - '!src/test/**'
```

### タグフィルタ

```yaml
tags:
  - v*.*.*
  - 'v[0-9]+.[0-9]+.[0-9]+'
```

## 複合イベント

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *'
```
