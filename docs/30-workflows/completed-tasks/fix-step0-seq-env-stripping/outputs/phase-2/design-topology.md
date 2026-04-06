# Phase 2 成果物: 設計トポロジー

## Concern マップ

```
TASK-FIX-ENV-STRIPPING
    └── Concern-01: env オプション修正
            ├── 対象: SkillExecutor.ts:861
            ├── 変更: { ANTHROPIC_API_KEY: apiKey }
            │          → { ...process.env, ANTHROPIC_API_KEY: apiKey }
            ├── セキュリティ境界: Main プロセス内（IPC 境界の内側）
            ├── 検証: 既存 `SkillExecutor.auth.test.ts` に PATH / precedence のアサーションを追加
            └── 後続タスク:
                    ├── TASK-FIX-AUTH-IPC-001
                    ├── TASK-FIX-EXECUTE-PLAN-FF-001
                    └── TASK-FIX-LIFECYCLE-PANEL-ERROR-001
```

## 依存グラフ

```
TASK-FIX-ENV-STRIPPING (P0, 本タスク)
    ↓ 完了後に解除
TASK-FIX-AUTH-IPC-001
TASK-FIX-EXECUTE-PLAN-FF-001
TASK-FIX-LIFECYCLE-PANEL-ERROR-001
```

## セキュリティ境界図

```
[Renderer Process]
    |  IPC 呼び出し（引数: apiKey のみ）
    ↓
[Main Process]
    SkillExecutor.callSDKQuery()
    env = { ...process.env, ANTHROPIC_API_KEY: apiKey }
    |  spawn()
    ↓
[SDK 子プロセス]
    node cli.js
    受信環境変数: { PATH, HOME, NODE_ENV, ..., ANTHROPIC_API_KEY }

※ process.env 全体は Main プロセス → 子プロセス方向にのみ流れる
※ Renderer には返却しない
```
