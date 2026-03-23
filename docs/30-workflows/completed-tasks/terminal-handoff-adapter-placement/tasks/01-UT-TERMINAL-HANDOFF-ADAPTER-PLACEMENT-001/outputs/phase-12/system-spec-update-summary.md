# システム仕様更新サマリー

## タスク情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 |
| 完了日   | 2026-03-22                                |

## Step 1: タスク完了記録

### Step 1-A: 仕様書完了記録

worktree 環境での `.claude/skills/` 更新はコンフリクトリスクがあるため、PR 作成時に main ブランチで実施する。

更新対象:

- `aiworkflow-requirements/LOGS.md` にタスク完了エントリ追加
- `task-specification-creator/LOGS.md` にタスク完了記録追加
- `aiworkflow-requirements/SKILL.md` 変更履歴更新
- `task-specification-creator/SKILL.md` 変更履歴更新

### Step 1-D: topic-map.md 再生成

PR 作成時に `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行。

## Step 2: システム仕様更新

### 更新対象

| ファイル                                                        | 更新内容                                                      |
| --------------------------------------------------------------- | ------------------------------------------------------------- |
| `architecture-overview.md`                                      | adapters 一覧に `handoff/` を追加                             |
| `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | HandoffSource 型と toHandoffGuidance() インターフェースを追記 |

### 新規追加モジュール

```text
apps/desktop/src/main/adapters/handoff/
  index.ts                      # re-export
  toHandoffGuidance.ts          # adapter 関数本体（純粋関数）
  types.ts                      # HandoffSource Discriminated Union
  __tests__/
    toHandoffGuidance.test.ts   # 16 テストケース（T-01〜T-16）
```

### 型定義追加

- `HandoffSource` (Discriminated Union): `ChatEditHandoffSource | AgentHandoffSource | SkillHandoffSource | BundleHandoffSource`
- 各 source 型に `readonly kind` フィールドで判別
