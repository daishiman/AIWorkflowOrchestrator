---
# ============================================================
# タスク仕様テンプレート - skill-creator 自動実行対応
# ============================================================
# このテンプレートを使用してタスクを作成すると、
# skill-creator スキルによる自動実行が可能になります。
# ============================================================

id: TASK-{PHASE}-{NUMBER} # 例: TASK-2-A, TASK-3-1
title: "{タスクタイトル}" # 人間が読める簡潔なタイトル
phase: { number } # フェーズ番号（実行順序）
depends_on: [] # 依存タスクID（これらが完了後に実行可能）
parallel_with: [] # 同時実行可能なタスクID
blocks: [] # このタスク完了を待っているタスクID
status: pending # pending | in_progress | completed | blocked | failed
priority: medium # low | medium | high | critical
estimated_complexity: medium # small | medium | large | xlarge

# 実行エンジン設定
execution:
  mode: sequential # sequential | parallel | interactive
  timeout_minutes: 30 # タイムアウト（分）
  retry_count: 2 # 失敗時リトライ回数
  allow_partial: false # 部分完了を許可するか

# 検証設定
verification:
  auto_verify: true # 自動検証を行うか
  require_tests: true # テスト通過を必須とするか
  require_typecheck: true # 型チェック通過を必須とするか

# タグ（検索・フィルタ用）
tags:
  - { layer } # backend | frontend | shared | infra
  - { category } # types | service | ui | test | docs
  - { technology } # typescript | react | electron | etc

# 成果物定義
artifacts:
  creates: [] # 新規作成するファイルパス
  modifies: [] # 修正するファイルパス
  deletes: [] # 削除するファイルパス
---

# {タスクタイトル}

## 概要

{1-2文でタスクの目的を説明}

## 入力

{このタスクが必要とする前提条件・依存タスクの成果物}

- {依存タスクID}: {その成果物の説明}

## 出力

{このタスクが生成する成果物}

- `{ファイルパス}`: {成果物の説明}

## 実行手順

{skill-creator が自動実行する際の具体的な手順}

### Step 1: {ステップ名}

**ツール**: {使用するツール: Read | Write | Edit | Bash | Glob | Grep}

**操作**:

```
{具体的な操作内容}
```

**期待結果**: {このステップ完了時の状態}

### Step 2: {ステップ名}

...

## 実装コード

{生成すべきコードのテンプレート}

```typescript
// {ファイルパス}

{
  コード内容;
}
```

## 検証条件

{タスク完了を判定するための条件}

### 必須条件

- [ ] {条件1}
- [ ] {条件2}

### 自動検証コマンド

```bash
# 型チェック
pnpm --filter {package} typecheck

# リント
pnpm --filter {package} lint

# テスト
pnpm --filter {package} test -- --grep "{テストパターン}"
```

## エラーハンドリング

{失敗時の対処方法}

### よくあるエラーと対処

| エラー    | 原因   | 対処法   |
| --------- | ------ | -------- |
| {エラー1} | {原因} | {対処法} |

### ロールバック手順

```bash
# ロールバックが必要な場合の手順
{コマンド}
```

## メモ

{実装者への補足情報、注意点など}
