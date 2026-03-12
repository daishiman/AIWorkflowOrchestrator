# Regression Check

## 再実行した確認

| コマンド                                                                                    | 結果                                                       |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `pnpm exec vitest run scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs` | PASS（4 tests）                                            |
| `node scripts/validate-workspace-parent-reference-sweep.mjs --json`                         | PASS（`path-drift=0`, `status-drift=0`, `mirror-drift=0`） |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`    | PASS（差分 0）                                             |

## 回帰なし判定

- pointer docs を履歴仕様として残しても validator は false positive を出さない。
- status wording を「移管済み」へ変えても `pending` / `未着手` 検知は維持される。
- aiworkflow indexes 再生成後も rsync を挟めば mirror drift は再発しない。
