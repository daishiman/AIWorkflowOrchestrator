# タスク一覧

スキルインポートエージェントシステムの全タスク仕様書。

---

## クイックサマリー

| ティア              | 内容                          | タスク数 | 目的                             |
| ------------------- | ----------------------------- | -------- | -------------------------------- |
| 🎯 **Tier 1: MVP**  | 基本機能（Phase 1-8）         | 17       | スキル実行・インポート・権限管理 |
| 🚀 **Tier 2: 拡張** | スキル管理（Phase 9A-C, 10A） | 4        | 作成・編集・改善                 |
| 🔮 **Tier 3: 将来** | 高度な機能（Phase 9D-J）      | 7        | チェーン・共有・統計             |

**推奨実行順序**: Tier 1 完了 → Tier 2 → Tier 3（オプション）

---

## 進捗トラッキング

```bash
# 全タスク進捗
grep -h "^status:" tasks/task-*.md | sort | uniq -c

# ティア別進捗
grep -l "tier: 1" tasks/task-*.md | xargs grep "^status:" | sort | uniq -c
```

---

## 依存関係グラフ（簡略版）

```
┌─────────────────────────────────────────────────────────────────────┐
│  🎯 Tier 1: MVP（リリース必須）                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [1-1 型定義] ──┬── [2A Scanner] ──┐                               │
│                ├── [2B Store]    ──┼── [3-1 Executor] ──┐          │
│                └── [2C Security] ──┘   [3-2 Permission] ──┤         │
│                                                          ▼          │
│                         [4-1 IPC定義] ──── [4-2 IPCハンドラ]        │
│                                                  │                  │
│                                                  ▼                  │
│                                           [5-1 SkillAPI]            │
│                                                  │                  │
│                                                  ▼                  │
│                                           [6-1 SkillSlice]          │
│                                           ┌──────┼──────┐           │
│                                           ▼      ▼      ▼           │
│                                    [7A Selector][7B Import][7C Perm]│
│                                           └──────┬──────┘           │
│                                                  ▼                  │
│                                      [7D ChatPanel統合]             │
│                                           ┌──────┼──────┐           │
│                                           ▼      ▼      ▼           │
│                                    [8A Unit][8B Component][8C E2E]  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  🚀 Tier 2: 拡張（推奨）                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│               [9A Editor]  [9B skill-creator]  [9C Improver]        │
│                     └──────────────┬───────────────┘                │
│                                    ▼                                │
│                         [10A LifecyclePanel]                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  🔮 Tier 3: 将来（オプション）                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [9D Chain] [9E Fork] [9F Share] [9G Schedule]                      │
│  [9H Debug] [9I Docs] [9J Analytics]                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Tier 1: MVP（17タスク）

> スキルのインポート・実行・権限管理の基本機能

### Phase 1: 基盤層

| ID       | タイトル                                     | 依存 | 複雑度 | ステータス |
| -------- | -------------------------------------------- | ---- | ------ | ---------- |
| TASK-1-1 | [共通型定義](./task-1-1-type-definitions.md) | -    | small  | pending    |

### Phase 2: サービス層（並列可）

| ID      | タイトル                                            | 依存 | 複雑度 | ステータス |
| ------- | --------------------------------------------------- | ---- | ------ | ---------- |
| TASK-2A | [SkillScanner](./task-2a-skill-scanner.md)          | 1-1  | medium | pending    |
| TASK-2B | [SkillImportStore](./task-2b-skill-import-store.md) | 1-1  | medium | pending    |
| TASK-2C | [SecurityPatterns](./task-2c-security-patterns.md)  | 1-1  | small  | pending    |

### Phase 3: 実行エンジン（並列可）

| ID       | タイトル                                                | 依存       | 複雑度 | ステータス |
| -------- | ------------------------------------------------------- | ---------- | ------ | ---------- |
| TASK-3-1 | [SkillExecutor](./task-3-1-skill-executor.md)           | 2A, 2B, 2C | large  | pending    |
| TASK-3-2 | [PermissionResolver](./task-3-2-permission-resolver.md) | 2A, 2B, 2C | small  | pending    |

### Phase 4: IPC層

| ID       | タイトル                                      | 依存     | 複雑度 | ステータス |
| -------- | --------------------------------------------- | -------- | ------ | ---------- |
| TASK-4-1 | [IPCチャネル定義](./task-4-1-ipc-channels.md) | 3-1, 3-2 | small  | pending    |
| TASK-4-2 | [IPCハンドラー](./task-4-2-ipc-handlers.md)   | 4-1      | medium | pending    |

### Phase 5: Preload API

| ID       | タイトル                            | 依存     | 複雑度 | ステータス |
| -------- | ----------------------------------- | -------- | ------ | ---------- |
| TASK-5-1 | [SkillAPI](./task-5-1-skill-api.md) | 4-1, 4-2 | medium | pending    |

### Phase 6: 状態管理

| ID       | タイトル                                | 依存 | 複雑度 | ステータス |
| -------- | --------------------------------------- | ---- | ------ | ---------- |
| TASK-6-1 | [SkillSlice](./task-6-1-skill-slice.md) | 5-1  | medium | pending    |

### Phase 7: UIコンポーネント（7A-C並列可）

| ID      | タイトル                                              | 依存       | 複雑度 | ステータス |
| ------- | ----------------------------------------------------- | ---------- | ------ | ---------- |
| TASK-7A | [SkillSelector](./task-7a-skill-selector.md)          | 6-1        | medium | pending    |
| TASK-7B | [SkillImportDialog](./task-7b-skill-import-dialog.md) | 6-1        | medium | pending    |
| TASK-7C | [PermissionDialog](./task-7c-permission-dialog.md)    | 6-1        | medium | pending    |
| TASK-7D | [ChatPanel統合](./task-7d-chat-panel-integration.md)  | 7A, 7B, 7C | medium | pending    |

### Phase 8: テスト（並列可）

| ID      | タイトル                                             | 依存                  | 複雑度 | ステータス |
| ------- | ---------------------------------------------------- | --------------------- | ------ | ---------- |
| TASK-8A | [単体テスト](./task-8a-unit-tests.md)                | 2A, 2B, 3-1, 3-2, 6-1 | medium | pending    |
| TASK-8B | [コンポーネントテスト](./task-8b-component-tests.md) | 7A, 7B, 7C, 7D        | medium | pending    |
| TASK-8C | [統合テスト](./task-8c-integration-tests.md)         | 4-1, 4-2, 5-1, 7D     | large  | pending    |

---

## 🚀 Tier 2: 拡張（4タスク）

> スキルの作成・編集・改善・ライフサイクル管理

| ID       | タイトル                                               | 依存       | 複雑度 | ステータス |
| -------- | ------------------------------------------------------ | ---------- | ------ | ---------- |
| TASK-9A  | [SkillEditor](./task-9a-skill-editor.md)               | Tier 1完了 | large  | pending    |
| TASK-9B  | [skill-creator メタスキル](./task-9b-skill-creator.md) | Tier 1完了 | xlarge | pending    |
| TASK-9C  | [SkillImprover](./task-9c-skill-improver.md)           | Tier 1完了 | large  | pending    |
| TASK-10A | [ライフサイクル管理UI](./task-10a-skill-lifecycle.md)  | 9A, 9B, 9C | xlarge | pending    |

---

## 🔮 Tier 3: 将来（7タスク）

> 高度なスキル管理機能（優先度: 低、Tier 2完了後に独立実装可能）

| ID      | タイトル                                                  | 依存 | 複雑度 | ステータス |
| ------- | --------------------------------------------------------- | ---- | ------ | ---------- |
| TASK-9D | [スキルチェーン機能](./task-9d-skill-chain.md)            | 9B   | large  | pending    |
| TASK-9E | [スキルフォーク・派生機能](./task-9e-skill-fork.md)       | 9B   | medium | pending    |
| TASK-9F | [スキル共有・インポート機能](./task-9f-skill-share.md)    | 9B   | large  | pending    |
| TASK-9G | [スキルスケジュール実行機能](./task-9g-skill-schedule.md) | 9B   | large  | pending    |
| TASK-9H | [スキルデバッグモード](./task-9h-skill-debug.md)          | 9B   | large  | pending    |
| TASK-9I | [スキルドキュメント生成機能](./task-9i-skill-docs.md)     | 9B   | medium | pending    |
| TASK-9J | [スキル使用統計・分析機能](./task-9j-skill-analytics.md)  | 9B   | medium | pending    |

---

## クリティカルパス

**最短実行パス（Tier 1）**:

```
1-1 → 2A → 3-1 → 4-1 → 4-2 → 5-1 → 6-1 → 7D → 8C
```

**並列実行グループ**:

1. Phase 2: 2A, 2B, 2C（同時実行可能）
2. Phase 3: 3-1, 3-2（同時実行可能）
3. Phase 7: 7A, 7B, 7C（同時実行可能）
4. Phase 8: 8A, 8B, 8C（同時実行可能）

---

## タスクメタデータフォーマット

```yaml
---
id: TASK-X-X
title: タスクタイトル
tier: 1 | 2 | 3 # ティア（MVP/拡張/将来）
phase: X
depends_on: []
parallel_with: [] # 並列実行可能タスク
blocks: [] # このタスク完了待ちのタスク
status: pending | in_progress | completed
priority: low | medium | high | critical
estimated_complexity: small | medium | large | xlarge
tags: [] # 検索用タグ

execution:
  mode: sequential | parallel
  timeout_minutes: 60
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates: []
  modifies: []
---
```

---

## 自動化コマンド

```bash
# タスク実行
skill-creator execute TASK-1-1

# 並列タスク実行
skill-creator execute --parallel TASK-2A TASK-2B TASK-2C

# Tier 1 全タスク実行
skill-creator execute-tier 1

# 進捗サマリー
skill-creator status ./tasks/
```
