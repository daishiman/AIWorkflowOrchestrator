# Versioning Guide

## 概要

セマンティックバージョニングに基づくエージェントのバージョン管理ガイド。

## セマンティックバージョニング

### 形式

```
major.minor.patch
```

### バージョン番号の意味

| 部分      | 意味               | 例      | インクリメント条件   |
| --------- | ------------------ | ------- | -------------------- |
| **major** | メジャーバージョン | `1`.0.0 | 破壊的変更           |
| **minor** | マイナーバージョン | 1.`1`.0 | 機能追加（後方互換） |
| **patch** | パッチバージョン   | 1.0.`1` | バグ修正（後方互換） |

## バージョンアップ基準

### Major バージョンアップ（破壊的変更）

**インクリメント**: `1.5.3` → `2.0.0`

**条件**:

- ツールリストの変更（削除・置換）
- ワークフローの大幅変更
- YAML Frontmatterの必須フィールド変更
- 依存スキルの削除
- API互換性の破壊

**例**:

```yaml
# 変更前: v1.5.3
tools:
  - Read
  - Grep
  - Write

# 変更後: v2.0.0（破壊的変更）
tools:
  - Read
  - Grep
  - MultiEdit
```

### Minor バージョンアップ（機能追加）

**インクリメント**: `1.5.3` → `1.6.0`

**条件**:

- ツールの追加（削除なし）
- 新しいPhaseの追加
- 新しいスキル依存の追加
- オプションフィールドの追加
- 機能拡張（後方互換）

**例**:

```yaml
# 変更前: v1.5.3
tools:
  - Read
  - Grep

# 変更後: v1.6.0（機能追加）
tools:
  - Read
  - Grep
  - Glob
```

### Patch バージョンアップ（バグ修正）

**インクリメント**: `1.5.3` → `1.5.4`

**条件**:

- バグ修正
- ドキュメント修正
- 誤字脱字修正
- パフォーマンス改善（動作変更なし）
- リファクタリング（動作変更なし）

**例**:

```markdown
# 変更前: v1.5.3

## ワークフロー

### Phase 1: コード読み込み

1. ファイルを読み込みます（誤字: 読みこみます）

# 変更後: v1.5.4（誤字修正）

## ワークフロー

### Phase 1: コード読み込み

1. ファイルを読み込みます（修正済み）
```

## バージョン管理のワークフロー

### 1. 変更の分類

```
変更内容を分析
│
├─ 破壊的変更？
│  └─ YES → Major バージョンアップ
│
├─ 機能追加？
│  └─ YES → Minor バージョンアップ
│
└─ バグ修正のみ？
   └─ YES → Patch バージョンアップ
```

### 2. バージョン番号の更新

```yaml
---
name: my-agent
version: 1.6.0 # ← ここを更新
---
```

### 4. Git コミット

```bash
git add .claude/agents/my-agent.md
git commit -m "feat: add Glob tool support (v1.6.0)"
git tag v1.6.0
```

## Git コミットメッセージ規約

### Conventional Commits形式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type一覧

| Type              | 説明               | バージョン影響 |
| ----------------- | ------------------ | -------------- |
| `feat`            | 機能追加           | Minor ↑        |
| `fix`             | バグ修正           | Patch ↑        |
| `docs`            | ドキュメント修正   | Patch ↑        |
| `refactor`        | リファクタリング   | Patch ↑        |
| `perf`            | パフォーマンス改善 | Patch ↑        |
| `test`            | テスト追加・修正   | Patch ↑        |
| `chore`           | ビルド・設定変更   | -              |
| `BREAKING CHANGE` | 破壊的変更         | Major ↑        |

### 例

```bash
# Minor バージョンアップ
git commit -m "feat(my-agent): add Glob tool support"

# Patch バージョンアップ
git commit -m "fix(my-agent): correct Phase 2 step order"

# Major バージョンアップ
git commit -m "feat(my-agent)!: replace Write with MultiEdit

BREAKING CHANGE: Write tool removed, MultiEdit added"
```

## バージョン管理スクリプト

### version-bump.sh

```bash
#!/bin/bash
# version-bump.sh
# バージョンを自動的にインクリメントするスクリプト

AGENT_FILE="$1"
TYPE="$2"  # major|minor|patch

if [ ! -f "$AGENT_FILE" ]; then
    echo "エラー: ファイルが見つかりません: $AGENT_FILE"
    exit 1
fi

# 現在のバージョンを取得
CURRENT_VERSION=$(grep "^version:" "$AGENT_FILE" | sed 's/version: *//')

# セマンティックバージョンを分解
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# バージョンをインクリメント
case $TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
    *)
        echo "使用法: $0 <agent_file.md> <major|minor|patch>"
        exit 1
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# バージョンを更新
sed -i "s/^version: .*/version: $NEW_VERSION/" "$AGENT_FILE"

echo "バージョン更新: $CURRENT_VERSION → $NEW_VERSION"
```

### 使用例

```bash
# Patch バージョンアップ
./scripts/version-bump.sh .claude/agents/my-agent.md patch

# Minor バージョンアップ
./scripts/version-bump.sh .claude/agents/my-agent.md minor

# Major バージョンアップ
./scripts/version-bump.sh .claude/agents/my-agent.md major
```

## 依存関係のバージョン管理

### スキル依存のバージョン固定

```yaml
---
name: my-agent
description: |
  エージェント説明。

  🔴 スキル依存:
  - agent-architecture-patterns v1.0.0
  - agent-structure-design v1.2.0

version: 1.5.0
---
```

### バージョン互換性マトリックス

| エージェント    | スキル                      | 互換バージョン    |
| --------------- | --------------------------- | ----------------- |
| my-agent v1.5.0 | .claude/skills/agent-architecture-patterns/SKILL.md | >= 1.0.0, < 2.0.0 |
| my-agent v1.5.0 | .claude/skills/agent-structure-design/SKILL.md      | >= 1.2.0, < 2.0.0 |

## ベストプラクティス

### ✅ すべきこと

1. **セマンティックバージョニング遵守**: major.minor.patch形式
2. **変更履歴記録**: すべてのバージョンアップを記録
3. **破壊的変更の明示**: BREAKING CHANGEをコミットメッセージに
4. **Gitタグ使用**: バージョンごとにタグを付与
5. **依存バージョン固定**: スキル依存のバージョンを明記

### ❌ 避けるべきこと

1. **任意のバージョン番号**: セマンティックバージョニングに従わない
2. **変更履歴の省略**: バージョンアップの理由を記録しない
3. **破壊的変更の隠蔽**: Minorで破壊的変更を導入
4. **Gitタグなし**: バージョン追跡が困難
5. **依存バージョン未指定**: 互換性問題のリスク
