# Phase 1 受け入れ基準

## 受け入れ条件

| 観点         | 条件                                 | 合格基準                                          |
| ------------ | ------------------------------------ | ------------------------------------------------- |
| コマンド登録 | scripts にキー/値が存在              | `HAS_SCRIPT` かつ value 一致                      |
| 文書同期     | 旧実行コマンドが残存しない           | 旧文字列 `rg` 結果 0件                            |
| 実行再現性   | 登録コマンドで screenshot 再取得成功 | `TC-01..04` + `import-call-diagnostics.json` 生成 |
| カバレッジ   | coverage validator                   | `expected TC: 4 / covered TC: 4`                  |
| 仕様整合     | workflow02 verify                    | `13/13, error=0, warning=0`                       |

## 判定コマンド

```bash
pnpm --filter @repo/desktop run | rg screenshot
pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
```

## 完了判定

- [x] 受け入れ条件を機械検証可能な形式で定義
- [x] 判定コマンドを確定
